const express = require('express');
const cors = require('cors');
const midtransClient = require('midtrans-client');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

const app = express();
app.use(cors());
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://lelangin-e4ceb-default-rtdb.firebaseio.com'
});
const db = admin.database();

let snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: 'SB-Mid-server-Mudh_amEJHqCqYMI-pwfmjD3',
  clientKey: 'SB-Mid-client-hNPkg-u971C8DR4c'
});

app.post('/create-transaction', async (req, res) => {
  const { order_id, gross_amount, item_details } = req.body;

  let parameter = {
    transaction_details: { order_id, gross_amount },
    item_details,
    enabled_payments: ['qris', 'dana', 'gopay', 'shopeepay', 'credit_card'],
    credit_card: { secure: true }
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    res.json({ redirect_url: transaction.redirect_url, token: transaction.token, order_id });
  } catch (error) {
    if (error.ApiResponse) {
      res.status(500).json({ error: error.message, midtransResponse: error.ApiResponse });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.get('/status-transaction/:orderId', async (req, res) => {
  const { orderId } = req.params;

  try {
    const response = await snap.transaction.status(orderId);
    if (response.transaction_status === 'settlement' || response.transaction_status === 'capture') {
      const parts = orderId.split('-');
      const userId = parts[1];
      const telurId = parts[2];
      const refPath = `pembelian_telur/${userId}/${telurId}`;
      await db.ref(refPath).remove();
    }
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(8082, () => {
  console.log('Server berjalan di port 8082');
});
