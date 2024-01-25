const express = require('express');
const router = express.Router();
const cosmosClient = require('./cosmosClient'); 

router.post('/', async (req, res) => {
  try {
    const today = req.query.date || new Date().toISOString().split('T')[0];
    const dailyPlan = await cosmosClient.getDailyPlan(today);

    if (dailyPlan) {
      // Update existing plan
      await cosmosClient.updateDailyPlan(today, req.body);
    } else {
      // Insert new plan
      await cosmosClient.createDailyPlan(today, req.body);
    }

    res.status(200).json({ message: 'Timetable updated successfully' });
  } catch (error) {
    console.error('Error updating daily plan:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
