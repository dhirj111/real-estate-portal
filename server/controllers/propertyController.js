const Property = require('../models/Property');

// GET /api/properties — returns all properties
async function getProperties(_req, res) {
  const properties = await Property.find().lean();
  res.status(200).json(properties);
}

module.exports = { getProperties };
