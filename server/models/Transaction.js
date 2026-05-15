const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  partyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Party', required: true },
  section: { type: String, enum: ['beauty', 'bangles'], required: true },
  type: { type: String, enum: ['in', 'out'], required: true },
  // 'in'  = money received / customer paid us  → balance increases
  // 'out' = money given  / we paid provider    → balance decreases
  amount: { type: Number, required: true, min: 0 },
  note: { type: String, trim: true, default: '' },
  billImage: { type: String, default: '' }, // filename stored in /uploads
  date: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
