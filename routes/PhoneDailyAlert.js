const cosmosClient = require('./cosmosClient');
const express = require('express');
const router = express.Router();

// Function to get the current plan for the half-hour interval
// Function to round the current time to the nearest half-hour
// Function to get the current plan for the exact or next half-hour interval
async function getCurrentPlan() {
    // Get the current date and time
    const now = new Date();
  
    // Format the time to "HH:mm" format
    const currentTime = now.toISOString().slice(11, 16);
    console.log("currentTime", currentTime);
  
    // Calculate the next half-hour time
    const nextHalfHourTime = calculateNextHalfHour(currentTime);
    console.log("nextHalfHourTime", nextHalfHourTime);
  
    // Fetch the daily plan for the current date
    const currentDate = now.toISOString().slice(0, 10);
    const dailyPlan = await cosmosClient.getDailyPlan(currentDate);
    console.log("dailyPlan", dailyPlan);
  
    if (!dailyPlan) {
      return null; // Handle the case where the plan for the date is not found
    }
  
    // Extract the "timetable" array from the daily plan
    const timetable = dailyPlan.activities.timetable;
    console.log("timetable", timetable);
  
    // Find the activity that matches the current time or the next half-hour time
    const currentActivity = timetable.find(
      (activity) => activity.time === currentTime || activity.time === nextHalfHourTime
    );
    console.log("currentActivity", currentActivity);
  
    return currentActivity || null; // Return the matching activity or null if not found
  }
  
  // Function to calculate the next half-hour time
  function calculateNextHalfHour(time) {
    const [hours, minutes] = time.split(':').map(Number);
    let nextHours = hours;
    let nextMinutes = minutes;
  
    if (minutes >= 30) {
      nextMinutes = 30;
    } else {
      nextMinutes = 0;
    }
  
    return `${nextHours.toString().padStart(2, '0')}:${nextMinutes.toString().padStart(2, '0')}`;
  }
  
  // Example usage in your route
  router.get('/', async (req, res) => {
    try {
      // Get the current plan for the half-hour interval
      const currentActivity = await getCurrentPlan();
      console.log("currentActivity", currentActivity);
  
      if (!currentActivity) {
        res.status(404).json({ error: 'No activity found for the current time' });
      } else {
        res.json({ currentActivity });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  
  
  module.exports = router;