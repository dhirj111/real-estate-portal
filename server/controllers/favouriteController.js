const mongoose = require('mongoose');
const Favourite = require('../models/Favourite');
const Property = require('../models/Property');

// GET /api/favourites — current user's favourited properties
async function getFavourites(req, res) {
  // userId always comes from the verified JWT token, never from the request body
  const userId = req.user.id;

  const favs = await Favourite.find({ userId }).populate('propertyId').lean();
  const properties = favs.map(f => f.propertyId); // populated Property docs
  res.status(200).json(properties);
}

// POST /api/favourites/:propertyId — add to favourites
async function addFavourite(req, res) {
  const userId = req.user.id;
  const { propertyId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    return res.status(400).json({ error: 'Invalid property ID' });
  }

  const property = await Property.findById(propertyId);
  if (!property) {
    return res.status(404).json({ error: 'Property not found' });
  }

  const existing = await Favourite.findOne({ userId, propertyId });
  if (existing) {
    return res.status(409).json({ error: 'Already favourited' });
  }

  await Favourite.create({ userId, propertyId });
  res.status(201).json({ message: 'Added to favourites' });
}

// DELETE /api/favourites/:propertyId — remove from favourites
async function removeFavourite(req, res) {
  const userId = req.user.id;
  const { propertyId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    return res.status(400).json({ error: 'Invalid property ID' });
  }

  const result = await Favourite.findOneAndDelete({ userId, propertyId });
  if (!result) {
    return res.status(404).json({ error: 'Favourite not found' });
  }

  res.status(200).json({ message: 'Removed from favourites' });
}

module.exports = { getFavourites, addFavourite, removeFavourite };
