const { Router } = require('express');
const { getFavourites, addFavourite, removeFavourite } = require('../controllers/favouriteController');

const router = Router();

router.get('/', getFavourites);
router.post('/:propertyId', addFavourite);
router.delete('/:propertyId', removeFavourite);

module.exports = router;
