const { CosmosClient } = require("@azure/cosmos");
const config = require("../config");

const endpoint = config.endpoint;
const key = config.key;
const databaseId = config.database.id;
const containerConfig = config.container.bookings;

const client = new CosmosClient({ endpoint, key });

async function getBookings() {
  const querySpec = {
    query: "SELECT * FROM c WHERE c.type = 'booking'",
  };

  const { resources: items } = await client
    .database(databaseId)
    .container(containerConfig.id)
    .items.query(querySpec)
    .fetchAll();

  return items;
}

async function updateBooking(id, booking) {
  try {
    const partitionKeyValue = booking.bookingId;
    const { resource: updatedItem } = await client
      .database(databaseId)
      .container(containerConfig.id)
      .item(id, partitionKeyValue) // Specify partition key
      .replace(booking);

    return updatedItem;
  } catch (error) {
    console.error("Error updating booking:", error);
    throw new Error(
      "Entity with the specified id does not exist in the system."
    );
  }
}

async function addYearFieldToBookings() {
  try {
    const bookings = await getBookings();

    for (const booking of bookings) {
      const startDate = new Date(booking.startDate);
      const year = startDate.getFullYear();
      booking.year = year; // Add the year field

      // Update the booking in the database
      await updateBooking(booking.id, booking);
      console.log(`Updated booking ${booking.id} with year ${year}`);
    }

    console.log("All bookings updated with the year field.");
  } catch (error) {
    console.error("Error updating bookings:", error);
  }
}

// Run the function to update all bookings
addYearFieldToBookings();
