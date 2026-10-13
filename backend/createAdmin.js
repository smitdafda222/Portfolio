const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/portfolio';

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Explicitly create the collection if it doesn't exist yet
    await User.createCollection();
    console.log('User collection ensured in the database.');

    // Check if admin already exists
    let admin = await User.findOne({ email: 'admin@portfolio.com' });
    if (admin) {
      console.log('Admin user already exists!');
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      admin = new User({
        name: 'Portfolio Owner',
        email: 'admin@portfolio.com',
        password: hashedPassword,
        role: 'admin'
      });

      await admin.save();
      console.log('==============================================');
      console.log('Admin user created successfully!');
      console.log('Email: admin@portfolio.com');
      console.log('Password: admin123');
      console.log('==============================================');
    }
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error creating admin:', err);
    mongoose.connection.close();
  }
}

createAdmin();
