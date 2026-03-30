const { Router } = require('express');
const { getProperties } = require('../controllers/propertyController');

const router = Router();

router.get('/', getProperties);

module.exports = router;
