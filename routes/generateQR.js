const express = require('express');
const router = express.Router();
const qrcode = require('qrcode');

router.post('/', async (req, res) => {
  const { amount } = req.body;
  const upiId = 'paytmqr5j57pv@ptys'; // Replace with your UPI ID
  const upiLink = `upi://pay?pa=${upiId}&pn=RAHUL+K+S&am=${amount}&cu=INR`;

  try {
    const qr = await qrcode.toDataURL(upiLink);
    res.json({ qr });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR' });
  }
});

module.exports = router;
