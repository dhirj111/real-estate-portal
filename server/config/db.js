const mongoose = require('mongoose');
const Property = require('../models/Property');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/real-estate-portal';

async function seedProperties() {
  try {
    const count = await Property.countDocuments();
    if (count > 0) return; // Already seeded

    await Property.insertMany([
      { title: 'Sunset Ridge Villa', location: 'Beverly Hills, CA', price: 4850000, beds: 5, baths: 4, sqft: 5800, type: 'Villa', image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80' },
      { title: 'Downtown Manhattan Penthouse', location: 'Manhattan, New York', price: 12500000, beds: 4, baths: 5, sqft: 6200, type: 'Penthouse', image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80' },
      { title: 'Lakefront Retreat', location: 'Lake Tahoe, NV', price: 2750000, beds: 4, baths: 3, sqft: 3400, type: 'Cabin', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
      { title: 'Modern Coastal Home', location: 'Malibu, CA', price: 6200000, beds: 5, baths: 4, sqft: 4800, type: 'House', image_url: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600&q=80' },
      { title: 'Historic Brownstone', location: 'Boston, MA', price: 1850000, beds: 3, baths: 2, sqft: 2600, type: 'Brownstone', image_url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80' },
      { title: 'Tech Hub Apartment', location: 'San Francisco, CA', price: 2200000, beds: 2, baths: 2, sqft: 1800, type: 'Apartment', image_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80' },
      { title: 'Desert Luxury Estate', location: 'Scottsdale, AZ', price: 3500000, beds: 6, baths: 5, sqft: 7200, type: 'Estate', image_url: 'https://images.unsplash.com/photo-1512917492800-c52646db42da?w=600&q=80' },
      { title: 'Mountain Chalet', location: 'Aspen, CO', price: 8900000, beds: 5, baths: 4, sqft: 5100, type: 'Chalet', image_url: 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=600&q=80' },
      { title: 'Oceanfront Bungalow', location: 'Miami Beach, FL', price: 3150000, beds: 3, baths: 3, sqft: 2900, type: 'Bungalow', image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80' },
      { title: 'Suburban Family Home', location: 'Austin, TX', price: 980000, beds: 4, baths: 3, sqft: 3200, type: 'House', image_url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80' },
    ]);
    console.log('🌱  10 demo properties seeded successfully');
  } catch (err) {
    console.error('❌  Failed to seed properties:', err.message);
  }
}

async function connectDB() {
  await mongoose.connect(MONGO_URI);
  console.log('🗄️  MongoDB connected');
  await seedProperties();
}

module.exports = { connectDB };
