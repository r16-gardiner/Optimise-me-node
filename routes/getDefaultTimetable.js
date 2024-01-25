const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, './Timetable.json'); // Adjust the path as necessary

function getDefaultTimetable(dateString) {
  return new Promise((resolve, reject) => {
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        const dailyPlanData = JSON.parse(data);
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        // const currentDay = daysOfWeek[new Date().getDay()];
        const dateObject = new Date(dateString);
        const currentDay = daysOfWeek[dateObject.getDay()];
        const defaultTimetable = dailyPlanData[currentDay];
        if (defaultTimetable) {
          resolve(defaultTimetable);
        } else {
          reject(new Error('No default timetable found for today'));
        }
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
}

module.exports = getDefaultTimetable;
