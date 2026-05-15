const express = require('express');
const router = express.Router();
const Party = require('../models/Party');
const Transaction = require('../models/Transaction');
const protect = require('../middleware/auth');

// GET /api/parties?section=beauty&type=customer
router.get('/', protect, async (req, res) => {
  try {
    const { section, type } = req.query;
    const filter = { createdBy: req.user.id }; // ← only this user's parties
    if (section) filter.section = section;
    if (type)    filter.type    = type;

    const parties = await Party.find(filter).sort({ updatedAt: -1 });
    res.json(parties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/parties/summary?section=beauty
router.get('/summary', protect, async (req, res) => {
  try {
    const { section } = req.query;
    const filter = { createdBy: req.user.id }; // ← only this user's parties
    if (section) filter.section = section;

    const parties = await Party.find(filter);
    let willGet = 0, willGive = 0;
    parties.forEach(p => {
      if (p.balance > 0) willGet  += p.balance;
      else               willGive += Math.abs(p.balance);
    });
    res.json({ willGet, willGive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/parties/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const party = await Party.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!party) return res.status(404).json({ message: 'Party not found' });
    res.json(party);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/parties
router.post('/', protect, async (req, res) => {
  try {
    const { name, phone, type, section } = req.body;
    if (!name || !type || !section)
      return res.status(400).json({ message: 'Name, type and section are required' });

    const party = await Party.create({
      name, phone, type, section, balance: 0,
      createdBy: req.user.id, // ← tag with this user's ID
    });
    res.status(201).json(party);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/parties/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const party = await Party.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      { new: true }
    );
    if (!party) return res.status(404).json({ message: 'Party not found' });
    res.json(party);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/parties/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const party = await Party.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!party) return res.status(404).json({ message: 'Party not found' });
    await Transaction.deleteMany({ partyId: req.params.id });
    res.json({ message: 'Party deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
