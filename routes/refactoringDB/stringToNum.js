const { CosmosClient } = require("@azure/cosmos");
const config = require("../config");

const endpoint = config.endpoint;
const key = config.key;
const databaseId = config.database.id;
const containerId = config.container.bookings.id;

const client = new CosmosClient({ endpoint, key });

async function fetchAllBookings() {
  const container = client.database(databaseId).container(containerId);
  const querySpec = {
    query: "SELECT * FROM c WHERE c.type = 'booking'"
  };
  const { resources: bookings } = await container.items.query(querySpec).fetchAll();
  return bookings;
}

async function updateBooking(booking) {
  const container = client.database(databaseId).container(containerId);
  const { id } = booking;
  const response = await container.item(id, id).replace(booking);
  return response.resource;
}

async function convertAndSaveBookings() {
  const bookings = await fetchAllBookings();
  let count = 0;

  for (const booking of bookings) {
    // Convert numerical fields
    booking.weeklyPrice = parseFloat(booking.weeklyPrice) || 0;  // Default to 0 if conversion fails
    booking.deposit = parseFloat(booking.deposit) || 0;
    booking.final = parseFloat(booking.final) || 0;
    booking.totalPaid = parseFloat(booking.totalPaid) || 0;
    booking.numberOfGuests = parseInt(booking.numberOfGuests, 10) || 0;

    // Update booking in the database
    await updateBooking(booking);
    count++;
  }

  console.log(`Updated ${count} bookings.`);
}

convertAndSaveBookings().then(() => {
  console.log('Conversion process complete.');
}).catch(error => {
  console.error('An error occurred during conversion:', error);
});
