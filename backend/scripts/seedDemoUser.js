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
  online: {
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

// Message Schema (simplified for seeding)
const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);
const Message = mongoose.model('Message', messageSchema);

// Demo users data
const demoUsers = [
  {
    username: 'DemoUser',
    email: 'demo@chatapp.com',
    password: 'Demo123!',
    online: true,
    role: 'main'
  },
  {
    username: 'AliceJohnson',
    email: 'alice@example.com',
    password: 'Demo123!',
    online: true,
    role: 'friend'
  },
  {
    username: 'BobSmith',
    email: 'bob@example.com',
    password: 'Demo123!',
    online: false,
    role: 'friend'
  },
  {
    username: 'CarolDavis',
    email: 'carol@example.com',
    password: 'Demo123!',
    online: true,
    role: 'friend'
  },
  {
    username: 'DavidWilson',
    email: 'david@example.com',
    password: 'Demo123!',
    online: false,
    role: 'friend'
  },
  {
    username: 'EvaGreen',
    email: 'eva@example.com',
    password: 'Demo123!',
    online: true,
    role: 'friend'
  },
  {
    username: 'FrankMiller',
    email: 'frank@example.com',
    password: 'Demo123!',
    online: false,
    role: 'friend'
  },
  {
    username: 'GraceKing',
    email: 'grace@example.com',
    password: 'Demo123!',
    online: true,
    role: 'friend'
  }
];

// Sample conversations with realistic messages
const conversationTemplates = [
  {
    with: 'AliceJohnson',
    messages: [
      { from: 'AliceJohnson', content: 'Hey! How are you doing?', time: -240 },
      { from: 'DemoUser', content: 'Hi Alice! I\'m doing great, thanks for asking. How about you?', time: -235 },
      { from: 'AliceJohnson', content: 'I\'m good too! Just finished a big project at work 🎉', time: -230 },
      { from: 'DemoUser', content: 'That\'s awesome! Congratulations! What kind of project was it?', time: -225 },
      { from: 'AliceJohnson', content: 'A new web application for our client. It was challenging but fun!', time: -220 },
      { from: 'DemoUser', content: 'Sounds exciting! I love working on web apps too. What technologies did you use?', time: -215 },
      { from: 'AliceJohnson', content: 'React, Node.js, and MongoDB - similar to this chat app actually 😄', time: -210 },
      { from: 'DemoUser', content: 'Nice! That\'s a solid tech stack. I\'m always impressed by what we can build with modern tools.', time: -5 }
    ]
  },
  {
    with: 'BobSmith',
    messages: [
      { from: 'BobSmith', content: 'Good morning! Ready for the weekend?', time: -180 },
      { from: 'DemoUser', content: 'Absolutely! Any plans?', time: -175 },
      { from: 'BobSmith', content: 'Thinking of going hiking. The weather looks perfect!', time: -170 },
      { from: 'DemoUser', content: 'That sounds amazing! I love hiking. Which trail are you thinking of?', time: -165 },
      { from: 'BobSmith', content: 'The mountain trail near the lake. You should join if you\'re free!', time: -160 },
      { from: 'DemoUser', content: 'I\'d love to! What time are you planning to start?', time: -155 }
    ]
  },
  {
    with: 'CarolDavis',
    messages: [
      { from: 'CarolDavis', content: 'Did you see the latest tech news? 🚀', time: -120 },
      { from: 'DemoUser', content: 'Not yet! What\'s happening?', time: -115 },
      { from: 'CarolDavis', content: 'New AI breakthrough in natural language processing!', time: -110 },
      { from: 'DemoUser', content: 'Wow, that\'s exciting! AI is advancing so quickly these days.', time: -105 },
      { from: 'CarolDavis', content: 'I know right? It\'s both fascinating and a bit overwhelming', time: -100 },
      { from: 'DemoUser', content: 'Definitely! But I think it opens up so many possibilities for developers like us.', time: -95 },
      { from: 'CarolDavis', content: 'True! Speaking of which, how\'s your chat app project going?', time: -90 },
      { from: 'DemoUser', content: 'Really well! Just deployed it with real-time messaging. Want to test it out?', time: -2 }
    ]
  },
  {
    with: 'DavidWilson',
    messages: [
      { from: 'DemoUser', content: 'Hey David! How\'s the new job treating you?', time: -300 },
      { from: 'DavidWilson', content: 'It\'s been great! Really enjoying the team and the projects.', time: -295 },
      { from: 'DemoUser', content: 'That\'s wonderful to hear! What kind of work are you doing there?', time: -290 },
      { from: 'DavidWilson', content: 'Full-stack development, mainly working on e-commerce platforms.', time: -285 },
      { from: 'DemoUser', content: 'Sounds challenging and rewarding! Any interesting features you\'ve built recently?', time: -280 }
    ]
  },
  {
    with: 'EvaGreen',
    messages: [
      { from: 'EvaGreen', content: 'Hey! Love the new chat app design! 💫', time: -60 },
      { from: 'DemoUser', content: 'Thank you so much! I put a lot of effort into making it user-friendly.', time: -55 },
      { from: 'EvaGreen', content: 'It really shows! The UI is so clean and intuitive.', time: -50 },
      { from: 'DemoUser', content: 'I appreciate the feedback! UX design is really important to me.', time: -45 },
      { from: 'EvaGreen', content: 'You nailed it! The real-time messaging works perfectly too.', time: -40 },
      { from: 'DemoUser', content: 'Thanks! That was the most challenging part to implement with Socket.IO.', time: -35 },
      { from: 'EvaGreen', content: 'Well done! This could definitely be a great portfolio piece.', time: -1 }
    ]
  },
  {
    with: 'FrankMiller',
    messages: [
      { from: 'FrankMiller', content: 'Quick question about the deployment process', time: -150 },
      { from: 'DemoUser', content: 'Sure! What do you need help with?', time: -145 },
      { from: 'FrankMiller', content: 'How did you handle the CORS issues with the frontend and backend?', time: -140 },
      { from: 'DemoUser', content: 'I configured the backend to allow requests from the frontend domain specifically.', time: -135 },
      { from: 'FrankMiller', content: 'Smart approach! Did you use environment variables for the URLs?', time: -130 },
      { from: 'DemoUser', content: 'Exactly! Makes it easy to switch between development and production.', time: -125 }
    ]
  },
  {
    with: 'GraceKing',
    messages: [
      { from: 'GraceKing', content: 'Just wanted to say congratulations on launching your chat app! 🎊', time: -30 },
      { from: 'DemoUser', content: 'Thank you so much Grace! It means a lot coming from you.', time: -25 },
      { from: 'GraceKing', content: 'You\'ve always been passionate about building great software.', time: -20 },
      { from: 'DemoUser', content: 'This project really pushed me to learn new technologies and best practices.', time: -15 },
      { from: 'GraceKing', content: 'It shows! The attention to detail is impressive.', time: -10 },
      { from: 'DemoUser', content: 'Thanks! I\'m already thinking about new features to add next.', time: -3 }
    ]
  }
];

function getRandomLastSeen() {
  const now = new Date();
  const randomMinutes = Math.floor(Math.random() * 1440); // Random minutes in last 24 hours
  return new Date(now.getTime() - (randomMinutes * 60 * 1000));
}

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chatapp';
    await mongoose.connect(mongoUri);
    console.log('🔗 Connected to MongoDB');
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data (optional - uncomment if you want fresh data)
    // await User.deleteMany({});
    // await Message.deleteMany({});
    // console.log('🧹 Cleared existing data');

    // Create users
    console.log('👥 Creating demo users...');
    const createdUsers = {};
    const saltRounds = 12;

    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`   ✓ ${userData.username} already exists`);
        createdUsers[userData.username] = existingUser;
      } else {
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
        
        const user = new User({
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          online: userData.online,
          lastSeen: userData.online ? new Date() : getRandomLastSeen(),
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random creation date within last week
        });

        await user.save();
        createdUsers[userData.username] = user;
        console.log(`   ✓ Created ${userData.username} (${userData.email})`);
      }
    }

    // Create messages for conversations
    console.log('\n💬 Creating conversation messages...');
    const demoUser = createdUsers['DemoUser'];

    for (const conversation of conversationTemplates) {
      const otherUser = createdUsers[conversation.with];
      if (!otherUser) continue;

      console.log(`   📝 Creating conversation with ${conversation.with}...`);
      
      for (const msg of conversation.messages) {
        const sender = msg.from === 'DemoUser' ? demoUser : otherUser;
        const recipient = msg.from === 'DemoUser' ? otherUser : demoUser;
        
        // Check if message already exists
        const existingMsg = await Message.findOne({
          sender: sender._id,
          recipient: recipient._id,
          content: msg.content
        });

        if (!existingMsg) {
          const message = new Message({
            sender: sender._id,
            recipient: recipient._id,
            content: msg.content,
            messageType: 'text',
            readBy: msg.from === 'DemoUser' ? [demoUser._id] : [demoUser._id, sender._id], // Mark as read
            createdAt: new Date(Date.now() + (msg.time * 60 * 1000)), // Convert minutes to milliseconds
            updatedAt: new Date(Date.now() + (msg.time * 60 * 1000))
          });

          await message.save();
        }
      }
      console.log(`   ✓ Conversation with ${conversation.with} created`);
    }

    // Summary
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   👥 Users created: ${demoUsers.length}`);
    console.log(`   💬 Conversations: ${conversationTemplates.length}`);
    console.log(`   📝 Total messages: ${conversationTemplates.reduce((total, conv) => total + conv.messages.length, 0)}`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('   📧 Email: demo@chatapp.com');
    console.log('   🔒 Password: Demo123!');
    console.log('   👤 Username: DemoUser');
    
    console.log('\n🌟 Your chat app now has realistic demo data!');
    console.log('   • Multiple active users online');
    console.log('   • Real conversation history');
    console.log('   • Varied message timestamps');
    console.log('   • Professional portfolio content');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔐 Database connection closed');
    process.exit(0);
  }
}

// Run the seed function
console.log('🚀 ChatApp Database Seeder');
console.log('==========================');
seedDatabase(); 