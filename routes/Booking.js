const { CosmosClient } = require("@azure/cosmos");
const config = require("./config");

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

async function getBooking(id) {
  try {
    const { resource: booking } = await client
      .database(databaseId)
      .container(containerConfig.id)
      .item(id, id) // Specify partition key
      .read();
    return booking;
  } catch (error) {
    console.error("Error getting booking:", error);
    throw new Error("Booking not found");
  }
}

let customerCounter = 1;

function generateCustomerId() {
  const formattedCounter = String(customerCounter).padStart(4, "0");
  customerCounter += 1;
  return `CUST${formattedCounter}`;
}

function generateReadableId(prefix) {
  const now = new Date();
  const year = now.getFullYear().toString().slice(2); // Get last two digits of the year
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(now.getDate()).padStart(2, "0");
  const time = now.getTime().toString().slice(-5); // Last 5 digits of timestamp

  return `${prefix}${year}${month}${day}${time}`;
}

async function createBooking(booking) {
  booking.bookingId = generateReadableId("BOOK"); // Auto-generate human-readable bookingId
  booking.customerId = generateCustomerId(); // Auto-generate human-readable customerId
  booking.type = "booking"; // Ensure type is set for filtering
  booking.id = booking.bookingId; // Ensure bookingId is used as document id

  const { resource: createdItem } = await client
    .database(databaseId)
    .container(containerConfig.id)
    .items.create(booking, { partitionKey: booking.bookingId });

  return createdItem;
}

async function updateBooking(id, booking) {
  try {
    const partitionKeyValue = booking.bookingId;
    const id = booking.id; // Ensure the id is set correctly
    
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

async function deleteBooking(id) {
  try {
    await client
      .database(databaseId)
      .container(containerConfig.id)
      .item(id, id) // Specify partition key
      .delete();
  } catch (error) {
    console.error("Error deleting booking:", error);
    throw new Error(
      "Entity with the specified id does not exist in the system."
    );
  }
}
async function getCurrentYearBookingsShort() {
  const currentYear = new Date().getFullYear();
  const startDateOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);
  const endDateOfYear = new Date(`${currentYear}-12-31T23:59:59.999Z`);

  try {
    const querySpec = {
      query:
        "SELECT c.bookingId, c.startDate, c.endDate, c.weeklyPrice, c.booked, c.paymentStatus, c.weekNumber FROM c WHERE c.startDate >= @startOfYear AND c.startDate <= @endOfYear AND c.type = 'booking'",
      parameters: [
        { name: "@startOfYear", value: startDateOfYear.toISOString() },
        { name: "@endOfYear", value: endDateOfYear.toISOString() },
      ],
    };

    const { resources: bookings } = await client
      .database(databaseId)
      .container(containerConfig.id)
      .items.query(querySpec)
      .fetchAll();

    // Process the bookings to set paymentStatus to null if not "blocked"
    const processedBookings = bookings.map(booking => {
      if (booking.paymentStatus !== 'blocked') {
        return { ...booking, paymentStatus: null };
      }
      return booking;
    });

    // Sort the processed bookings by weekNumber
    processedBookings.sort((a, b) => a.weekNumber - b.weekNumber);

    return processedBookings;
  } catch (error) {
    console.error("Error fetching current year bookings:", error);
    throw new Error("Error fetching bookings for the current year");
  }
}

async function getBookingShort(id) {
  try {
    const querySpec = {
      query:
        "SELECT c.bookingId, c.startDate, c.endDate, c.weeklyPrice, c.booked FROM c WHERE c.id = @id AND c.type = 'booking'",
      parameters: [
        {
          name: "@id",
          value: id,
        },
      ],
    };

    const { resources: bookings } = await client
      .database(databaseId)
      .container(containerConfig.id)
      .items.query(querySpec)
      .fetchAll();

    if (bookings.length > 0) {
      return bookings[0];
    } else {
      throw new Error("Booking not found");
    }
  } catch (error) {
    console.error("Error getting booking:", error);
    throw new Error("Booking not found");
  }
}

async function getTotalBookings(year) {
  try {
    let query = "SELECT VALUE COUNT(1) FROM c WHERE c.type = 'booking' AND c.booked = true";
    const parameters = [];

    if (year) {
      query += " AND c.year = @year";
      parameters.push({ name: "@year", value: year });
    }

    const querySpec = { query, parameters };

    const { resources: items } = await client
      .database(databaseId)
      .container(containerConfig.id)
      .items.query(querySpec)
      .fetchAll();

    console.log("Total Bookings Query Result:", items);
    return items.length > 0 ? items[0] : 0;
  } catch (error) {
    console.error("Error fetching total bookings:", error);
    return 0;
  }
}

async function getTotalRevenue(year) {
  try {
    let query = "SELECT VALUE SUM(c.totalPaid) FROM c WHERE c.type = 'booking' AND c.booked = true";
    const parameters = [];

    if (year) {
      query += " AND c.year = @year";
      parameters.push({ name: "@year", value: year });
    }

    const querySpec = { query, parameters };

    console.log("Query:", querySpec); // Debugging

    const { resources } = await client
      .database(databaseId)
      .container(containerConfig.id)
      .items.query(querySpec)
      .fetchAll();

    console.log("Resources:", resources); // Debugging

    return resources.length > 0 ? resources[0].toFixed(2) : 0; // Ensure a valid number is returned
  } catch (error) {
    console.error("Error fetching total revenue:", error);
    return 0;
  }
}



async function getBookingsByDateRange(startDate, endDate) {
  const querySpec = {
    query:
      "SELECT * FROM c WHERE c.type = 'booking' AND c.startDate >= @startDate AND c.endDate <= @endDate",
    parameters: [
      { name: "@startDate", value: startDate },
      { name: "@endDate", value: endDate },
    ],
  };

  const { resources: items } = await client
    .database(databaseId)
    .container(containerConfig.id)
    .items.query(querySpec)
    .fetchAll();

  // Sort the items by weekNumber
  items.sort((a, b) => a.weekNumber - b.weekNumber);

  return items;
}

async function getFrequentCustomers() {
  const querySpec = {
    query:
      "SELECT c.customerId, COUNT(1) AS bookingCount FROM c WHERE c.type = 'booking' GROUP BY c.customerId HAVING COUNT(1) > 1",
  };

  const { resources: items } = await client
    .database(databaseId)
    .container(containerConfig.id)
    .items.query(querySpec)
    .fetchAll();

  return items;
}

async function getBookingsByYear(year) {
  const querySpec = {
    query: `
      SELECT * FROM c
      WHERE c.type = 'booking' AND c.year = @year
    `,
    parameters: [
      { name: "@year", value: year }
    ]
  };

  try {
    const { resources } = await client
      .database(databaseId)
      .container(containerConfig.id)
      .items.query(querySpec)
      .fetchAll();

    // Sort the resources by weekNumber
    resources.sort((a, b) => a.weekNumber - b.weekNumber);

    return resources;
  } catch (error) {
    console.error("Error fetching bookings for the year:", error);
    throw new Error("Error fetching bookings for the specified year");
  }
}

async function getPaymentStatusCounts(year) {
  try {
    let query = "SELECT c.paymentStatus, COUNT(1) AS count FROM c WHERE c.type = 'booking'";
    const parameters = [];

    if (year) {
      query += " AND c.year = @year";
      parameters.push({ name: "@year", value: year });
    }
    query += " GROUP BY c.paymentStatus";

    const querySpec = { query, parameters };

    console.log("Query:", querySpec);

    const { resources: items } = await client
      .database(databaseId)
      .container(containerConfig.id)
      .items.query(querySpec)
      .fetchAll();

    const paymentStatusCounts = items.reduce((acc, item) => {
      acc[item.paymentStatus] = item.count;
      return acc;
    }, {});

    return paymentStatusCounts;
  } catch (error) {
    console.error("Error fetching payment status counts:", error);
    throw new Error("Error fetching payment status counts");
  }
}




module.exports = {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  getCurrentYearBookingsShort,
  getBookingShort,
  getTotalBookings,
  getBookingsByDateRange,
  getTotalRevenue,
  getFrequentCustomers,
  getBookingsByYear, 
  getPaymentStatusCounts 
};
