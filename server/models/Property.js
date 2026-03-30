const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  title:     { type: String, required: true },
  location:  { type: String, required: true },
  price:     { type: Number, required: true },
  image_url: { type: String },
  beds:      { type: Number, default: 3 },
  baths:     { type: Number, default: 2 },
  sqft:      { type: Number, default: 2000 },
  type:      { type: String, default: 'House' },
});

module.exports = mongoose.models.Property || mongoose.model('Property', PropertySchema);
