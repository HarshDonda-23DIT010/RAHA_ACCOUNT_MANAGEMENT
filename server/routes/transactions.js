const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Transaction = require('../models/Transaction');
const Party = require('../models/Party');
const protect = require('../middleware/auth');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf/;
    const ext  = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  },
});

// GET /api/transactions?partyId=xxx
router.get('/', protect, async (req, res) => {
  try {
    const { partyId, section } = req.query;
    const filter = { createdBy: req.user.id }; // ← only this user's transactions
    if (partyId) filter.partyId = partyId;
    if (section) filter.section = section;

    const txns = await Transaction.find(filter).sort({ date: -1 });
    res.json(txns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/transactions (with optional bill image)
router.post('/', protect, upload.single('billImage'), async (req, res) => {
  try {
    const { partyId, section, type, amount, note, date } = req.body;
    if (!partyId || !section || !type || !amount)
      return res.status(400).json({ message: 'partyId, section, type, amount are required' });

    // Ensure the party belongs to this user
    const party = await Party.findOne({ _id: partyId, createdBy: req.user.id });
    if (!party) return res.status(404).json({ message: 'Party not found' });

    const amt = parseFloat(amount);
    const billImage = req.file ? req.file.filename : '';

    // Update balance
    if (type === 'in') party.balance += amt;
    else               party.balance -= amt;
    await party.save();

    const txn = await Transaction.create({
      partyId, section, type, amount: amt,
      note: note || '', billImage,
      date: date ? new Date(date) : new Date(),
      createdBy: req.user.id, // ← tag with user
    });

    res.status(201).json(txn);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const txn = await Transaction.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!txn) return res.status(404).json({ message: 'Transaction not found' });

    // Reverse balance on the party
    const party = await Party.findById(txn.partyId);
    if (party) {
      if (txn.type === 'in') party.balance -= txn.amount;
      else                   party.balance += txn.amount;
      await party.save();
    }

    // Delete bill image file
    if (txn.billImage) {
      const imgPath = path.join(__dirname, '../uploads', txn.billImage);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await txn.deleteOne();
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
