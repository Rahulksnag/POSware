// const { google } = require('googleapis');
// const clientPromise = require('./mongoClient');

// const auth = new google.auth.OAuth2(
//   process.env.CLIENT_ID,
//   process.env.CLIENT_SECRET,
//   process.env.REDIRECT_URI
// );
// auth.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

// const gmail = google.gmail({ version: 'v1', auth });

// async function pollGmail() {
//   const client = await clientPromise;
//   const db = client.db('gmailDB');
//   const emails = db.collection('emails');
//   const state = db.collection('state');

//   try {
//     const res = await gmail.users.messages.list({
//       userId: 'me',
//       q: 'from:no-reply@paytm.com',
//       maxResults: 5,
//     });

//     const messages = res.data.messages || [];

//     for (const msg of messages) {
//       const existing = await emails.findOne({ id: msg.id });
//       if (existing) continue;

//       const fullMsg = await gmail.users.messages.get({
//         userId: 'me',
//         id: msg.id,
//       });

//       const snippet = fullMsg.data.snippet;
//       const internalDate = parseInt(fullMsg.data.internalDate);
//       const emailDateStr = new Date(internalDate).toISOString().split('T')[0];

//       // Extract transaction count
//       const txnMatch = snippet.match(/Transaction Count\s+#(\d+)/);
//       const txnCount = txnMatch ? parseInt(txnMatch[1]) : null;

//       if (!txnCount) {
//         console.warn(`⚠️ Could not find transaction count in message ${msg.id}`);
//         continue;
//       }

//       // Get current stored state
//       // const stateDoc = await state.findOne({ _id: 'txnTracker' });
//       // const lastDate = stateDoc?.date;
//       // const lastCount = stateDoc?.lastTxnCount ?? 0;

//       // const isNewDay = lastDate !== emailDateStr;
//       // const isNewTxn = txnCount > lastCount;

//       // if (isNewDay || isNewTxn) {
//       //   await emails.insertOne({
//       //     id: msg.id,
//       //     snippet,
//       //     internalDate,
//       //     txnCount,
//       //   });

//       //   await state.updateOne(
//       //     { _id: 'txnTracker' },
//       //     { $set: { date: emailDateStr, lastTxnCount: txnCount } },
//       //     { upsert: true }
//       //   );

//       //   console.log(`📩 Saved message ${msg.id} | Txn #${txnCount} on ${emailDateStr}`);
//       // }
//       const stateDoc = await state.findOne({ _id: emailDateStr });
//       const lastCount = stateDoc?.lastTxnCount ?? 0;

//       if (txnCount > lastCount) {
//         await emails.insertOne({
//           id: msg.id,
//           snippet,
//           internalDate,
//           txnCount,
//         });

//         await state.updateOne(
//           { _id: emailDateStr },
//           { $set: { lastTxnCount: txnCount } },
//           { upsert: true }
//         );

//         console.log(`📩 Saved message ${msg.id} | Txn #${txnCount} on ${emailDateStr}`);
//       }

//     }
//   } catch (err) {
//     console.error('❌ Gmail Polling Error:', err.message);
//   }
// }

// module.exports = pollGmail;
const { google } = require('googleapis');
const clientPromise = require('./mongoClient');

const auth = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);
auth.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

const gmail = google.gmail({ version: 'v1', auth });

async function pollGmail() {
  const client = await clientPromise;
  const db = client.db('gmailDB');
  const emails = db.collection('emails');
  const state = db.collection('state');

  try {
    const res = await gmail.users.messages.list({
      userId: 'me',
      q: 'from:no-reply@paytm.com',
      maxResults: 5,
    });

    const messages = res.data.messages || [];

    for (const msg of messages) {
      const existing = await emails.findOne({ id: msg.id });
      if (existing) continue;

      const fullMsg = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
      });

      const snippet = fullMsg.data.snippet;
      const internalDate = parseInt(fullMsg.data.internalDate);
      const emailDateStr = new Date(internalDate).toISOString().split('T')[0];

      const txnMatch = snippet.match(/Transaction Count\s+#(\d+)/);
      const txnCount = txnMatch ? parseInt(txnMatch[1]) : null;

      const amountMatch = snippet.match(/₹\s*([\d.]+)/);
      const parsedAmount = amountMatch ? parseFloat(amountMatch[1]) : null;

      if (!txnCount || !parsedAmount) {
        console.warn(`⚠️ Could not parse amount or txnCount in message ${msg.id}`);
        continue;
      }

      const stateDoc = await state.findOne({ _id: emailDateStr });
      const lastCount = stateDoc?.lastTxnCount ?? 0;

      if (txnCount > lastCount) {
        await emails.insertOne({
          id: msg.id,
          snippet,
          internalDate,
          txnCount,
          amount: parsedAmount,
        });

        await state.updateOne(
          { _id: emailDateStr },
          { $set: { lastTxnCount: txnCount } },
          { upsert: true }
        );

        console.log(`📩 Saved message ${msg.id} | Txn #${txnCount} | ₹${parsedAmount} on ${emailDateStr}`);
      }
    }
  } catch (err) {
    console.error('❌ Gmail Polling Error:', err.message);
  }
}

module.exports = pollGmail;
