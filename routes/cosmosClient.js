//@ts-check
const CosmosClient = require('@azure/cosmos').CosmosClient;

const config = require('./config')
const url = require('url')

const endpoint = config.endpoint
const key = config.key

const databaseId = config.database.id
const containerId = config.container.id
const partitionKey = { kind: 'Hash', paths: ['/partitionKey'] }

const options = {
      endpoint: endpoint,
      key: key,
      userAgentSuffix: 'CosmosDBJavascriptQuickstart'
    };

const client = new CosmosClient(options)
/**
 * Get the daily plan for a specific date
 */
async function getDailyPlan(date) {
  const querySpec = {
    query: 'SELECT * FROM c WHERE c.date = @date',
    parameters: [
      {
        name: '@date',
        value: date
      }
    ]
  };

  const { resources: items } = await client
    .database(databaseId)
    .container(containerId)
    .items.query(querySpec)
    .fetchAll();


  return items.length > 0 ? items[0] : null;
}

function aggregateTimeByType(activities) {
  const timeSpent = {};

  activities.forEach(activity => {
    // Check if activity is defined and has a 'type' property
    if (activity && activity.type) {
      const type = activity.type;
      timeSpent[type] = (timeSpent[type] || 0) + 0.5; // Assuming 30 min per activity
    }else {
      const type = 'Unplanned';
      timeSpent[type] = (timeSpent[type] || 0) + 0.5; // Assuming 30 min per activity
    }
  });

  return timeSpent;
}
async function getAllPlans(startDate, endDate) {
  let querySpec;
  if (startDate && endDate) {
    // Fetch activities between startDate and endDate
    querySpec = {
      query: 'SELECT c.activities.timetable FROM c WHERE c.date >= @startDate AND c.date <= @endDate',
      parameters: [
        { name: '@startDate', value: startDate },
        { name: '@endDate', value: endDate }
      ]
    };
  } else {
    // Fetch all activities if no specific date range is provided
    querySpec = {
      query: 'SELECT c.activities.timetable FROM c'
    };
  }

  const { resources: items } = await client
    .database(databaseId)
    .container(containerId)
    .items.query(querySpec)
    .fetchAll();

  const allActivities = items.flatMap(item => item.timetable);
  return aggregateTimeByType(allActivities);
}

/**
 * Create a new daily plan
 */
async function createDailyPlan(date, plan) {
  const dailyPlan = {
    date: date,
    activities: plan
  };

  const { resource: createdItem } = await client
    .database(databaseId)
    .container(containerId)
    .items.create(dailyPlan);

  console.log(`Created daily plan for date: ${date}`);
}

/**
 * Update an existing daily plan
 */
async function updateDailyPlan(date, plan) {
  const existingPlan = await getDailyPlan(date);
  if (!existingPlan) {
    throw new Error(`Daily plan for date ${date} not found`);
  }

  const updatedPlan = { ...existingPlan, activities: plan };

  const { resource: updatedItem } = await client
    .database(databaseId)
    .container(containerId)
    .item(existingPlan.id)
    .replace(updatedPlan);

  console.log(`Updated daily plan for date: ${date}`);
}

/**
 * Create the database if it does not exist
 */
async function createDatabase() {
  const { database } = await client.databases.createIfNotExists({
    id: databaseId
  })
  console.log(`Created database:\n${database.id}\n`)
}

/**
 * Read the database definition
 */
async function readDatabase() {
  const { resource: databaseDefinition } = await client
    .database(databaseId)
    .read()
  console.log(`Reading database:\n${databaseDefinition.id}\n`)
}

/**
 * Create the container if it does not exist
 */
async function createContainer() {
  const { container } = await client
    .database(databaseId)
    .containers.createIfNotExists(
      { id: containerId, partitionKey }
    )
  console.log(`Created container:\n${config.container.id}\n`)
}

/**
 * Read the container definition
 */
async function readContainer() {
  const { resource: containerDefinition } = await client
    .database(databaseId)
    .container(containerId)
    .read()
  console.log(`Reading container:\n${containerDefinition.id}\n`)
}



/**
 * Query the container using SQL
 */
async function queryContainer() {
  console.log(`Querying container:\n${config.container.id}`)

  // query to return all children in a family
  // Including the partition key value of country in the WHERE filter results in a more efficient query
  const querySpec = {
    query: 'SELECT VALUE r.children FROM root r WHERE r.partitionKey = @country',
    parameters: [
      {
        name: '@country',
        value: 'USA'
      }
    ]
  }

  const { resources: results } = await client
    .database(databaseId)
    .container(containerId)
    .items.query(querySpec)
    .fetchAll()
  for (var queryResult of results) {
    let resultString = JSON.stringify(queryResult)
    console.log(`\tQuery returned ${resultString}\n`)
  }
}
const habitsContainerId = 'habits';


/**
 * Log habit data for a specific day.
 * @param {string} date - The date for the habits document.
 * @param {array} habits - An array of habits for that day.
 */
async function logHabitData(date, habits) {
  const database = client.database(databaseId);
  const container = database.container(habitsContainerId);

  const newHabitsDocument = {
    date: date,
    habits: habits
  };

  // Create a new document for the day
  const { resource: createdItem } = await container.items.create(newHabitsDocument);
  console.log('Habits logged successfully for date:', date);
}

/**
 * Get habit data between two dates.
 * @param {string} startDate - The start date for the query range.
 * @param {string} endDate - The end date for the query range.
 * @returns {array} An array of habits documents.
 */
async function getHabitData(startDate, endDate) {
  const database = client.database(databaseId);
  const container = database.container(habitsContainerId);

  const querySpec = {
    query: 'SELECT * FROM c WHERE c.date >= @startDate AND c.date <= @endDate',
    parameters: [
      { name: '@startDate', value: startDate },
      { name: '@endDate', value: endDate }
    ]
  };

  const { resources: items } = await container.items.query(querySpec).fetchAll();

  return items;
}

/**
 * Update habit data in the database for a specific day.
 * @param {string} documentId - The ID of the habits document to update.
 * @param {string} date - The date for the habits document.
 * @param {array} habits - An array of habits for that day.
 */
async function updateHabitData(documentId, date, habits) {
  const database = client.database(databaseId);
  const container = database.container(habitsContainerId);

  try {
    const { resource: existingDocument } = await container.item(documentId, documentId).read();

    if (existingDocument) {
      // Create an updated document with the new habits data
      const updatedDocument = {
        id: existingDocument.id, // Keep the original document id
        date: date, // Update the date if necessary
        habits: habits // The updated habits array
      };

      // Replace the existing document with the updated one
      const { resource: updated } = await container.item(documentId, documentId).replace(updatedDocument);
      console.log(`Habits document ${documentId} updated successfully.`);
      return updated;
    } else {
      console.log(`Habits document with ID ${documentId} not found.`);
      throw new Error(`Habits document with ID ${documentId} not found.`);
    }
  } catch (error) {
    console.error(`Error updating habits document ${documentId}:`, error);
    throw error;
  }
}


/**
 * Cleanup the database and collection on completion
 */
async function cleanup() {
  await client.database(databaseId).delete()
}

/**
 * Exit the app with a prompt
 * @param {string} message - The message to display
 */
function exit(message) {
  console.log(message)
  console.log('Press any key to exit')
  process.stdin.setRawMode(true)
  process.stdin.resume()
  process.stdin.on('data', process.exit.bind(process, 0))
}


async function deleteOldHabitDocuments() {
  const database = client.database(databaseId);
  const container = database.container(habitsContainerId);

  try {
      const querySpec = {
          query: 'SELECT * FROM c WHERE IS_DEFINED(c.habit)'
      };

      const { resources: items } = await container.items.query(querySpec).fetchAll();

      console.log(`Found ${items.length} old habit documents to delete.`);

      for (const item of items) {
          console.log(`Attempting to delete document with id: ${item.id} and partition key: ${item.id}`);
          await container.item(item.id, item.id).delete(); // Using the id as the partition key
          console.log(`Deleted old habit document with id: ${item.id}`);
      }

      console.log('Deletion of old habit documents completed successfully.');
  } catch (error) {
      console.error('Failed to delete old habit documents:', error);
  }
}

const toDoListContainerId = 'ToDoToday'; // Define your to-do list container ID

async function logToDoData(date, dailyToDoItems) {
  const database = client.database(databaseId);
  const container = database.container(toDoListContainerId);

  const newToDoDocument = {
    date: date,
    dailyToDoItems: dailyToDoItems,
  };

  const { resource: createdItem } = await container.items.create(newToDoDocument);
  console.log('To-Do list logged successfully for date:', date);
}


async function getToDoData(startDate, endDate) {
  const database = client.database(databaseId);
  const container = database.container(toDoListContainerId);

  const querySpec = {
    query: 'SELECT * FROM c WHERE c.date >= @startDate AND c.date <= @endDate',
    parameters: [
      { name: '@startDate', value: startDate },
      { name: '@endDate', value: endDate }
    ]
  };

  const { resources: items } = await container.items.query(querySpec).fetchAll();
  return items;
}

async function updateToDoData(documentId, date, dailyToDoItems) {
  const database = client.database(databaseId);
  const container = database.container(toDoListContainerId);

  try {
    const { resource: existingDocument } = await container.item(documentId, documentId).read();
    if (existingDocument) {
      const updatedDocument = {
        id: existingDocument.id,
        date: date,
        dailyToDoItems: dailyToDoItems, // Updated array of tasks
      };

      const { resource: updated } = await container.item(documentId, documentId).replace(updatedDocument);
      console.log(`To-Do list document ${documentId} updated successfully.`);
    } else {
      console.log(`To-Do list document with ID ${documentId} not found.`);
      throw new Error(`To-Do list document with ID ${documentId} not found.`);
    }
  } catch (error) {
    console.error(`Error updating To-Do list document ${documentId}:`, error);
    throw error;
  }
}
/**
 * Merges new to-do items with existing ones, updating completion status if necessary.
 * If a to-do item from the new list matches an item in the existing list by name,
 * the completion status of the existing item is updated. New items are added to the list.
 * 
 * @param {Array} existingToDoItems - Array of existing to-do items.
 * @param {Array} newToDoItems - Array of new to-do items to be merged.
 * @returns {Array} The merged array of to-do items.
 */
function mergeToDoItems(existingToDoItems, newToDoItems) {
  const toDoMap = new Map();

  // Add all existing to-do items to the map with their name as the key
  existingToDoItems.forEach(item => {
      toDoMap.set(item.name, item);
  });

  // Merge or update with new to-do items
  newToDoItems.forEach(newItem => {
      // If the item exists, update the 'completed' status
      if (toDoMap.has(newItem.name)) {
          toDoMap.get(newItem.name).completed = newItem.completed;
      } else {
          // If the item doesn't exist, add it to the map
          toDoMap.set(newItem.name, newItem);
      }
  });

  // Convert the map back to an array and return
  return Array.from(toDoMap.values());
}



module.exports = {
    // createDatabase,
    client,
    readDatabase,
    createContainer,
    readContainer,
    queryContainer,
    cleanup,
    getDailyPlan,
    createDailyPlan,
    updateDailyPlan,
    getAllPlans,
    getHabitData,
    logHabitData,
    updateHabitData,
    // migrateData,
    deleteOldHabitDocuments,
    updateToDoData,
    getToDoData,
    logToDoData,
    mergeToDoItems

  };