const mongoose = require('mongoose');

const FavouriteSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
});

// Compound unique index — prevents duplicate favourites
FavouriteSchema.index({ userId: 1, propertyId: 1 }, { unique: true });

module.exports = mongoose.models.Favourite || mongoose.model('Favourite', FavouriteSchema);
