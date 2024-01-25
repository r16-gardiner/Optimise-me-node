const express = require('express');
const router = express.Router();
const cosmosClient = require('./cosmosClient'); // Adjust the path as necessary

function aggregateTimeByType(activities) {
  const timeSpent = {};

  activities.forEach(activity => {
    // Check if activity is defined and has a 'type' property
    if (activity && activity.type) {
      const type = activity.type;
      timeSpent[type] = (timeSpent[type] || 0) + 0.5; // Assuming 30 min per activity
    }
  });

  return timeSpent;
}

  router.get('/', async (req, res) => {
    try {
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;
  
      const activitySummary = await cosmosClient.getAllPlans(startDate, endDate);
      res.json(activitySummary);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send(error.message);
    }
  });
  
module.exports = router;