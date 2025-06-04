import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  try {
    console.log('🔌 Attempting to connect to MongoDB...');
    
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/outflo';
    
    // Log the connection string (without credentials for security)
    const maskedUri = mongoUri.includes('@') 
      ? mongoUri.replace(/:([^:@]+)@/, ':****@')
      : mongoUri;
    console.log(`🔗 Connecting to: ${maskedUri}`);
    
    // Connection options for better Atlas compatibility
    const connectionOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    };
    
    await mongoose.connect(mongoUri, connectionOptions);
    
    console.log('✅ Connected to MongoDB successfully');
    console.log(`📍 Database: ${mongoose.connection.name}`);
    console.log(`🔗 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
    
  } catch (error: any) {
    console.error('⚠️  MongoDB connection failed:', error.message);
    
    // Provide specific guidance based on error type
    if (error.message.includes('IP')) {
      console.log('🔧 IP Whitelist Issue: Add your current IP to MongoDB Atlas whitelist');
      console.log('📝 Go to: MongoDB Atlas > Network Access > Add IP Address');
    } else if (error.message.includes('authentication')) {
      console.log('🔧 Authentication Issue: Check your username and password');
    } else if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.log('🔧 SSL/TLS Issue: This might be a network or firewall issue');
    } else {
      console.log('🔧 Server will start without database connection');
      console.log('💡 To enable database features, please:');
      console.log('   1. Check your MongoDB Atlas cluster status');
      console.log('   2. Verify your connection string is correct');
      console.log('   3. Ensure your IP is whitelisted in Atlas');
    }
    
    // Don't throw error - let server start without database
    // throw error;
  }
};

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ Mongoose connection error:', error.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('📡 Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🔌 MongoDB connection closed through app termination');
  process.exit(0);
}); 