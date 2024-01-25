const cosmosClient = require('./cosmosClient');

/**
 * Merge new habits with existing ones, updating completion status if necessary.
 * @param {array} existingHabits - The current array of habits for the day.
 * @param {array} newHabits - The new habits to be merged.
 * @returns {array} The merged and updated array of habits.
 */
function mergeHabits(existingHabits, newHabits) {
    const habitMap = new Map();
  
    // Add all existing habits to the map
    existingHabits.forEach(habit => {
      habitMap.set(habit.name, habit);
    });
  
    // Merge or update with new habits
    newHabits.forEach(newHabit => {
      if (habitMap.has(newHabit.name)) {
        // If the habit exists, update the 'completed' status
        habitMap.get(newHabit.name).completed = newHabit.completed;
      } else {
        // If the habit doesn't exist, add it to the map
        habitMap.set(newHabit.name, newHabit);
      }
    });
  
    // Convert back to an array
    return Array.from(habitMap.values());
  }


async function PostPhoneHabit(req, res) {
  try {
    const dataString = req.body['']; // Assuming the data is in req.body['']
    const habitPairs = dataString.split('; '); // Split the string into pairs
    let habitsForDay = habitPairs.map(pair => {
        let [habit, status] = pair.split(', '); // Split each pair into habit and status
        return {
            name: habit.trim(),
            completed: status.trim().toLowerCase() === 'true',
        };
    });

    const date = new Date().toISOString().split('T')[0]; // Store the current date in YYYY-MM-DD format
    const existingDocuments = await cosmosClient.getHabitData(date, date);

    // Assuming there should only be one document per day
    if (existingDocuments.length > 0) {
        const existingDocument = existingDocuments[0];
        const mergedHabits = mergeHabits(existingDocument.habits, habitsForDay);
        await cosmosClient.updateHabitData(existingDocument.id, date, mergedHabits);
    } else {
        // Add new habit data
        await cosmosClient.logHabitData(date, habitsForDay);
    }

    res.status(200).send('Habits processed successfully');
  } catch (error) {
    console.error('Error in logHabitPhone:', error);
    res.status(500).send('Error processing habits: ' + error.message);
  }
}

module.exports = PostPhoneHabit;
