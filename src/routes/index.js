const express = require('express');

const router = express.Router();

const authRoute = require('./authRoute');
const catRoute = require('./categoryRoute');

router.get('/', (req, res) => {
  res.status(200).send('Hello from server');
});

router.use('/auth', authRoute);
router.use('/categorylist', catRoute);

module.exports = router;
