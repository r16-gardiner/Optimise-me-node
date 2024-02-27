const cosmosClient = require('./cosmosClient');
const express = require('express');
const router = express.Router();

async function GetToDoList(req, res) {
    try {
        const date = req.query.date || new Date().toISOString().split('T')[0];
        const items = await cosmosClient.getToDoData(date);
        if (items) {
            res.json(items);
            return;
        }
      } catch (error) {
        res.status(500).send('Error retrieving to-do data: ' + error.message);
      }
}

async function DeleteToDoList(req, res) {
    try {
        const date = req.query.date;
        if (!date) {
            res.status(400).send('Date query parameter is required');
            return;
        }

        const existingDocuments = await cosmosClient.getToDoData(date);

        if (existingDocuments.length > 0) {
            await cosmosClient.deleteToDoData(date);
            res.status(200).send(`To-Do list for ${date} deleted successfully`);
        } else {
            res.status(404).send('To-Do list not found for the specified date');
        }
    } catch (error) {
        console.error('Error in DeleteToDoList:', error);
        res.status(500).send('Error deleting to-do list: ' + error.message);
    }
}

async function PostToDoList(req, res) {
    try {
        const date = req.body.date || new Date().toISOString().split('T')[0];
        const newToDoItems = req.body.dailyToDoItems; // Assuming the body includes { date, dailyToDoItems }

        const existingDocuments = await cosmosClient.getToDoData(date);

        if (existingDocuments.length > 0) {
            const mergedToDoItems = cosmosClient.mergeToDoItems(existingDocuments[0].dailyToDoItems, newToDoItems);
            // Update existing to-do list for the date with merged items
            await cosmosClient.updateToDoData(date, mergedToDoItems);
            // Assuming existingDocuments contains documents with a structure like { id, date, dailyToDoItems }
            const existingToDoItems = existingDocuments[0].dailyToDoItems;

            // If the new list is smaller or items have been removed, update directly
            if (existingToDoItems.length < newToDoItems.length) {
                // Update existing to-do list for the date with new items
                await cosmosClient.updateToDoData(date, newToDoItems);
            } else {
                await cosmosClient.updateToDoData(date, newToDoItems);
                console.log("Handling other scenarios if applicable");
            }
        } else {
            // Create new to-do list data for the date
            await cosmosClient.logToDoData(date, newToDoItems);
        }

        res.status(200).send('To-Do list processed successfully');
    } catch (error) {
        console.error('Error in PostToDoList:', error);
        res.status(500).send('Error processing to-do list: ' + error.message);
    }
}

module.exports = { GetToDoList, PostToDoList, DeleteToDoList };
