const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/generate-qr', require('./routes/generateQR'));
app.use('/check-payment', require('./routes/checkPayment'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

const pollGmail = require('./utils/gmailPoller');

// 🔁 Poll Gmail every 10 seconds
setInterval(() => {
  console.log('📥 Checking Gmail...');
  pollGmail();
}, 5000); // 5 seconds

