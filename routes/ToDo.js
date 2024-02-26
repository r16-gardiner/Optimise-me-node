const cosmosClient = require('./cosmosClient');


async function GetToDoList(req, res) {
    try {
        const { startDate, endDate } = req.query;
        const items = await cosmosClient.getToDoData(startDate, endDate);
        res.status(200).json(items);
      } catch (error) {
        res.status(500).send('Error retrieving to-do data: ' + error.message);
      }
}

async function PushToDoList(req, res) {
    try {
        const { startDate, endDate } = req.query;
        const items = await cosmosClient.getToDoData(startDate, endDate);
        res.status(200).json(items);
      } catch (error) {
        res.status(500).send('Error retrieving to-do data: ' + error.message);
      }
}
async function PostToDoList(req, res) {
    try {
        // Assuming the to-do list data is in req.body as an array of { name, completed }
        const toDoItems = req.body; // Directly using the parsed JSON body
        console.log(toDoItems);

        const date = new Date().toISOString().split('T')[0]; // Store the current date in YYYY-MM-DD format
        const existingDocuments = await cosmosClient.getToDoData(date, date);
        
        // Check if there's already a document for today
        if (existingDocuments.length > 0) {
            const existingDocument = existingDocuments[0];
            // Assuming mergeToDoItems is a function you've created to merge today's to-do items
            // with the existing ones (similar to mergeHabits)
            const mergedToDoItems = mergeToDoItems(existingDocument.dailyToDoItems, toDoItems);
            await cosmosClient.updateToDoData(existingDocument.id, date, mergedToDoItems);
        } else {
            // Log new to-do list data for today
            await cosmosClient.logToDoData(date, toDoItems);
        }

        res.status(200).send('To-Do list processed successfully');
    } catch (error) {
        console.error('Error in PostToDoList:', error);
        res.status(500).send('Error processing to-do list: ' + error.message);
    }
}
module.exports = GetToDoList, PushToDoList, PostToDoList
