// const express = require('express');
// const router = express.Router();
// const clientPromise = require('../utils/mongoClient');

// router.get('/', async (req, res) => {
//   const { amount, after } = req.query;
//   const afterTime = parseInt(after);

//   console.log(`🪙 Amount: ₹${amount}`);
//   console.log(`🕐 After Time: ${afterTime} (${new Date(afterTime).toLocaleString()})`);

//   const client = await clientPromise;
//   const db = client.db('gmailDB');
//   const emails = db.collection('emails');

//   const regex = new RegExp(`₹\\s*${amount}\\b`);

//   const result = await emails.findOne({
//     snippet: { $regex: regex },
//     internalDate: { $gt: afterTime },
//   });

//   if (result) {
//     console.log(`✅ Match Found!`);
//     console.log(`📩 internalDate: ${result.internalDate} (${new Date(parseInt(result.internalDate)).toLocaleString()})`);
//     console.log(`🔢 txnCount: ${result.txnCount ?? 'N/A'}`);
//     res.json({ status: 'Success', time: result.internalDate });
//   } else {
//     console.log('⏳ Waiting for Payment Confirmation...');
//     res.json({ status: 'Pending' });
//   }
// });

// module.exports = router;
const express = require('express');
const router = express.Router();
const clientPromise = require('../utils/mongoClient');

router.get('/', async (req, res) => {
  const { amount, after } = req.query;
  const afterTime = parseInt(after);
  const targetAmount = parseFloat(amount);

  console.log(`🪙 Amount: ₹${targetAmount}`);
  console.log(`🕐 After Time: ${afterTime} (${new Date(afterTime).toLocaleString()})`);

  const client = await clientPromise;
  const db = client.db('gmailDB');
  const emails = db.collection('emails');

  const result = await emails.findOne({
    amount: targetAmount,
    internalDate: { $gt: afterTime },
  });

  if (result) {
    console.log(`✅ Match Found!`);
    console.log(`📩 internalDate: ${result.internalDate} (${new Date(parseInt(result.internalDate)).toLocaleString()})`);
    console.log(`🔢 txnCount: ${result.txnCount ?? 'N/A'}`);
    res.json({ status: 'Success', time: result.internalDate });
  } else {
    console.log('⏳ Waiting for Payment Confirmation...');
    res.json({ status: 'Pending' });
  }
});

module.exports = router;
