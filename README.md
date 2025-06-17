# 💸 POSware — Gmail-Based UPI Payment Detector

A lightweight Point-of-Sale-like (POS) system that uses Gmail API to confirm UPI payments via email.

## 🚀 Features

- 🧾 Generate UPI QR code for any amount
- ⏱ 5-minute timer to wait for confirmation
- 📬 Polls Gmail every 5 seconds for new Paytm payment emails
- 💾 Saves payment details to MongoDB
- 🔊 Plays sound upon successful payment verification

---

## 🧠 Tech Stack

- Node.js
- Express.js
- MongoDB (Atlas)
- Gmail API (OAuth2)
- HTML, CSS

---

## 📁 Folder Structure

```

GMDB/
├── node\_modules/
├── public/
│   ├── index.html
│   └── success.mp3
├── routes/
│   ├── generateQR.js
│   └── checkPayment.js
├── utils/
│   ├── gmailPoller.js
│   ├── mongoClient.js
│   └── getToken.js
├── .env
├── package.json
├── server.js

```

---

## ⚙️ Setup Guide

### 1️⃣ Gmail API + Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a **new project**
3. Enable the **Gmail API**  
   `APIs & Services > Library > Gmail API > Enable`

### 2️⃣ Create OAuth2 Credentials

- Go to `APIs & Services > Credentials > Create Credentials → OAuth Client ID`
- Choose: **Web Application**
- Add **Authorized Redirect URI**:  
```

[https://developers.google.com/oauthplayground]
```

After creation, note your:
- `Client ID`
- `Client Secret`

---

### 3️⃣ Get Refresh Token via OAuth Playground

1. Go to [OAuth Playground](https://developers.google.com/oauthplayground)
2. Click ⚙️ and check `Use your own OAuth credentials` → Paste Client ID & Secret
3. Select scope:  
```

Gmail API → [https://www.googleapis.com/auth/gmail.readonly]

````
4. Authorize & Exchange for tokens
5. Copy the **Refresh Token**

✅ You now have:
- CLIENT_ID
- CLIENT_SECRET
- REFRESH_TOKEN

---

## 🍃 MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database:
- **Name**: `gmailDB`
- Collections: `emails`, `state`

4. Add Database Access:
- Username: `Username`
- Password: `password`

5. Add IP Access:
- Add your IP address or `0.0.0.0/0` (public, not secure)

---

## 🔐 Create `.env` File

Create `.env` in root folder with:

```env
CLIENT_ID=your_google_client_id
CLIENT_SECRET=your_google_client_secret
REDIRECT_URI=https://developers.google.com/oauthplayground
REFRESH_TOKEN=your_refresh_token
MONGO_URI=mongodb+srv://<Username>:<password>@cluster0.mongodb.net/gmailDB?retryWrites=true&w=majority
````



## 🛠 Run Locally

### Install Dependencies

```bash
npm install
```

### Start the Server

```bash
node server.js
```

Open your browser:

```
http://localhost:3000
```

---

## 🧪 How It Works

* **Frontend**: Inputs amount → generates QR → timer starts
* **Backend**: Polls Gmail every 5s → checks if Paytm payment of that amount is found in recent emails

### Example Paytm Email:

```
Paytm For Business #PaytmKaro Payment Received ₹ 1.90...
Transaction Count #5 From BHIM UPI
```

Extracted:

* `txnCount`: 5
* `amount`: ₹1.90
* `internalDate`: timestamp

If it matches the query (correct amount, after QR time), it's confirmed ✅

---

## 📜 License

This project is for educational and experimental use. Not intended for production payment systems.

---

## 🙌 Credits

Developed with 💡 by \Rahul


