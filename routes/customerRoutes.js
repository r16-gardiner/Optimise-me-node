const { CosmosClient } = require("@azure/cosmos");
const config = require("./config");

const endpoint = config.endpoint;
const key = config.key;
const databaseId = config.database.id;
const containerConfig = config.container.customers;

const client = new CosmosClient({ endpoint, key });

async function getCustomers() {
  const querySpec = {
    query: "SELECT * FROM c WHERE c.type = 'customer'"
  };

  const { resources: items } = await client
    .database(databaseId)
    .container(containerConfig.id)
    .items.query(querySpec)
    .fetchAll();

  return items;
}

async function getCustomer(id) {
  try {
    const { resource: customer } = await client
      .database(databaseId)
      .container(containerConfig.id)
      .item(id, id) // Specify partition key
      .read();
    return customer;
  } catch (error) {
    console.error('Error getting customer:', error);
    throw new Error('Customer not found');
  }
}

async function createCustomer(customer) {
  customer.type = "customer"; // Ensure type is set for filtering
  customer.id = customer.customerId; // Ensure customerId is used as document id

  const { resource: createdItem } = await client
    .database(databaseId)
    .container(containerConfig.id)
    .items.create(customer, { partitionKey: customer.customerId });

  return createdItem;
}

async function updateCustomer(id, customer) {
  try {
    customer.id = id; // Ensure the id is set correctly
    const { resource: updatedItem } = await client
      .database(databaseId)
      .container(containerConfig.id)
      .item(id, id) // Specify partition key
      .replace(customer);

    return updatedItem;
  } catch (error) {
    console.error('Error updating customer:', error);
    throw new Error('Entity with the specified id does not exist in the system.');
  }
}

async function deleteCustomer(id) {
  try {
    await client
      .database(databaseId)
      .container(containerConfig.id)
      .item(id, id) // Specify partition key
      .delete();
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw new Error('Entity with the specified id does not exist in the system.');
  }
}

module.exports = {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
