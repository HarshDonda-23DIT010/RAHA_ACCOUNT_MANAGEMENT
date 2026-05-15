const mongoose = require('mongoose');

const partySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, trim: true, default: '' },
  type: { type: String, enum: ['customer', 'provider'], required: true },
  section: { type: String, enum: ['beauty', 'bangles'], required: true },
  balance: { type: Number, default: 0 },
  // balance > 0 means party owes us (you will get)
  // balance < 0 means we owe party (you will give)
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Party', partySchema);
