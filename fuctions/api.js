const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).catch(err => console.error('MongoDB connection error:', err));

// Contract schema
const contractSchema = new mongoose.Schema({
  id: Number,
  userEmail: String,
  accountSize: Number,
  challengeType: String,
  contractStatus: String,
  kycStatus: String,
  contractExpiry: String,
  payoutDate: String,
  phaseStatus: String,
  fundedDateISO: String,
});
const Contract = mongoose.model('Contract', contractSchema);

// Notification schema
const notificationSchema = new mongoose.Schema({
  userEmail: String,
  message: String,
  createdAt: Date,
});
const Notification = mongoose.model('Notification', notificationSchema);

// API endpoints
app.get('/api/contracts', async (req, res) => {
  const contracts = await Contract.find({ userEmail: req.headers['user-email'] });
  res.json(contracts);
});

app.get('/api/notifications', async (req, res) => {
  const notifications = await Notification.find({ userEmail: req.headers['user-email'] });
  res.json(notifications);
});

app.get('/api/summary', async (req, res) => {
  const userEmail = req.headers['user-email'];
  const contracts = await Contract.find({ userEmail });
  const notifications = await Notification.find({ userEmail });
  res.json({
    totalContracts: contracts.length,
    activeContracts: contracts.filter(c => c.contractStatus !== 'Disabled').length,
    pendingKyc: contracts.filter(c => c.kycStatus.toLowerCase() === 'pending').length,
    unreadNotifications: notifications.length,
  });
});

// Export for Netlify Functions
module.exports.handler = serverless(app);
