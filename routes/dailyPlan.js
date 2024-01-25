const cosmosClient = require('./cosmosClient');
const getDefaultTimetable = require('./getDefaultTimetable'); // Adjust the path as necessary

async function getDailyPlan(req, res) {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];

    const dailyPlan = await cosmosClient.getDailyPlan(date);
    if (dailyPlan) {
      res.json(dailyPlan);
      return;
    }

    // Fetch default timetable if not found in DB
    try {
      const defaultTimetable = await getDefaultTimetable(date);
      res.json(defaultTimetable);
    } catch (err) {
      console.error('Error fetching default timetable:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = getDailyPlan;
