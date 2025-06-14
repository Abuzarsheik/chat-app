const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User Schema (simplified for seeding)
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: ''
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

async function seedDemoUser() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chatapp';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if demo user already exists
    const existingUser = await User.findOne({ email: 'demo@chatapp.com' });
    
    if (existingUser) {
      console.log('Demo user already exists!');
      console.log('Email:', existingUser.email);
      console.log('Username:', existingUser.username);
      return;
    }

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('Demo123!', saltRounds);

    // Create demo user
    const demoUser = new User({
      username: 'DemoUser',
      email: 'demo@chatapp.com',
      password: hashedPassword,
      avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=3b82f6&color=ffffff&size=200',
      isOnline: false,
      lastSeen: new Date(),
      createdAt: new Date()
    });

    await demoUser.save();
    console.log('✅ Demo user created successfully!');
    console.log('📧 Email: demo@chatapp.com');
    console.log('🔑 Password: Demo123!');
    console.log('👤 Username: DemoUser');

    // Create a second demo user for testing conversations
    const existingUser2 = await User.findOne({ email: 'demo2@chatapp.com' });
    
    if (!existingUser2) {
      const hashedPassword2 = await bcrypt.hash('Demo123!', saltRounds);
      const demoUser2 = new User({
        username: 'TestUser',
        email: 'demo2@chatapp.com',
        password: hashedPassword2,
        avatar: 'https://ui-avatars.com/api/?name=Test+User&background=10b981&color=ffffff&size=200',
        isOnline: false,
        lastSeen: new Date(),
        createdAt: new Date()
      });

      await demoUser2.save();
      console.log('✅ Second demo user created successfully!');
      console.log('📧 Email: demo2@chatapp.com');
      console.log('🔑 Password: Demo123!');
      console.log('👤 Username: TestUser');
    }

  } catch (error) {
    console.error('❌ Error seeding demo user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedDemoUser(); 