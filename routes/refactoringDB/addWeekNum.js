const { CosmosClient } = require("@azure/cosmos");
const config = require("../config");

const endpoint = config.endpoint;
const key = config.key;
const databaseId = config.database.id;
const containerId = config.container.bookings.id;

const client = new CosmosClient({ endpoint, key });

async function fetchAllBookingsOrderedByStartDate() {
  const container = client.database(databaseId).container(containerId);
  const querySpec = {
    query: "SELECT * FROM c WHERE c.type = 'booking' ORDER BY c.startDate"
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

function calculateWeekNumber(bookings) {
  if (bookings.length === 0) return;

  const startDate = new Date(bookings[0].startDate);
  bookings.forEach(booking => {
    const currentStartDate = new Date(booking.startDate);
    const timeDiff = currentStartDate - startDate;
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    booking.weekNumber = Math.floor(daysDiff / 7) + 1;
  });
}

async function assignWeekNumbers() {
  const bookings = await fetchAllBookingsOrderedByStartDate();
  calculateWeekNumber(bookings);

  let count = 0;
  for (const booking of bookings) {
    await updateBooking(booking);
    count++;
  }

  console.log(`Updated ${count} bookings with week numbers.`);
}

assignWeekNumbers().then(() => {
  console.log('Week number assignment complete.');
}).catch(error => {
  console.error('An error occurred during the week numbering:', error);
});
