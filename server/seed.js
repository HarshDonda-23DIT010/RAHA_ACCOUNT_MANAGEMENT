require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

/**
 * ✅ HOW TO ADD A NEW ADMIN:
 * Add a new entry to the `users` array below with:
 *   - name:      Display name
 *   - sectionId: Login ID (will be uppercased)
 *   - password:  Plain text password (will be hashed)
 *   - section:   'beauty' | 'bangles' | 'admin'
 *   - role:      'admin' | 'user'
 *
 * Each admin sees ONLY their own customers & providers.
 * Run: node seed.js
 */

const users = [
  { name: 'Admin',          sectionId: '2001',      password: '123456',    section: 'admin',   role: 'admin' },
  { name: 'Beauty Manager', sectionId: 'BEAUTY-01', password: 'beauty123', section: 'beauty',  role: 'user'  },
  { name: 'Bangles Manager',sectionId: 'BANGLES-01',password: 'bangles123',section: 'bangles', role: 'user'  },
  // ➕ Add more admins here ↓
  // { name: 'New Admin',   sectionId: 'ADMIN-02', password: 'pass123', section: 'admin', role: 'admin' },
];

async function run() {
  const userSchema = new mongoose.Schema({
    name:      { type: String, required: true },
    sectionId: { type: String, required: true, unique: true, uppercase: true },
    password:  { type: String, required: true },
    section:   { type: String, enum: ['beauty', 'bangles', 'admin'], required: true },
    role:      { type: String, enum: ['admin', 'user'], default: 'admin' },
  }, { timestamps: true });

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  const User = mongoose.models.User || mongoose.model('User', userSchema);

  for (const u of users) {
    const id = u.sectionId.toUpperCase();
    const exists = await User.findOne({ sectionId: id });
    if (exists) {
      console.log(`⚠️  ${id} already exists — skipping`);
      continue;
    }
    const hashed = await bcrypt.hash(u.password, 10);
    await User.create({ ...u, sectionId: id, password: hashed });
    console.log(`✅ Created: ${id}  (password: ${u.password})`);
  }

  console.log('\n🎉 All done! Login credentials:');
  users.forEach(u => console.log(`   ID: ${u.sectionId.toUpperCase().padEnd(12)} | Password: ${u.password}`));
  console.log('\n💡 Each admin account has SEPARATE customers & providers.\n');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
