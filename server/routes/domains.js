const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Get all domains
router.get('/', async (req, res) => {
  try {
    const [domains] = await pool.execute(
      'SELECT * FROM domains ORDER BY name'
    );

    res.json(domains.map(domain => domain.name));
  } catch (error) {
    console.error('Error fetching domains:', error);
    res.status(500).json({ error: 'Failed to fetch domains' });
  }
});

// Get domain by name
router.get('/:name', async (req, res) => {
  try {
    const { name } = req.params;

    const [domains] = await pool.execute(
      'SELECT * FROM domains WHERE name = ?',
      [name]
    );

    if (domains.length === 0) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    res.json(domains[0]);
  } catch (error) {
    console.error('Error fetching domain:', error);
    res.status(500).json({ error: 'Failed to fetch domain' });
  }
});

module.exports = router;
