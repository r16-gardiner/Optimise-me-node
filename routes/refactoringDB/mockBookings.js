const mockBookings = [
    { bookingId: "BKG001", startDate: "2023-12-29", endDate: "2024-01-05", cost: 600, booked: false },
    { bookingId: "BKG002", startDate: "2024-01-05", endDate: "2024-01-12", cost: 380, booked: false },
    { bookingId: "BKG003", startDate: "2024-01-12", endDate: "2024-01-19", cost: 380, booked: false },
    { bookingId: "BKG004", startDate: "2024-01-19", endDate: "2024-01-26", cost: 380, booked: false },
    { bookingId: "BKG005", startDate: "2024-01-26", endDate: "2024-02-02", cost: 380, booked: false },
    { bookingId: "BKG006", startDate: "2024-02-02", endDate: "2024-02-09", cost: 380, booked: false },
    { bookingId: "BKG007", startDate: "2024-02-09", endDate: "2024-02-16", cost: 480, booked: false },
    { bookingId: "BKG008", startDate: "2024-02-16", endDate: "2024-02-23", cost: 550, booked: true },
    { bookingId: "BKG009", startDate: "2024-02-23", endDate: "2024-03-01", cost: 460, booked: true },
    { bookingId: "BKG010", startDate: "2024-03-01", endDate: "2024-03-08", cost: 460, booked: false },
    { bookingId: "BKG011", startDate: "2024-03-08", endDate: "2024-03-15", cost: 460, booked: false },
    { bookingId: "BKG012", startDate: "2024-03-15", endDate: "2024-03-22", cost: 0, booked: true },
    { bookingId: "BKG013", startDate: "2024-03-22", endDate: "2024-03-29", cost: 460, booked: false },
    { bookingId: "BKG014", startDate: "2024-03-29", endDate: "2024-04-05", cost: 530, booked: false },
    { bookingId: "BKG015", startDate: "2024-04-05", endDate: "2024-04-12", cost: 0, booked: true },
    { bookingId: "BKG016", startDate: "2024-04-12", endDate: "2024-04-19", cost: 530, booked: false },
    { bookingId: "BKG017", startDate: "2024-04-19", endDate: "2024-04-26", cost: 0, booked: true },
    { bookingId: "BKG018", startDate: "2024-04-26", endDate: "2024-05-03", cost: 480, booked: false },
    { bookingId: "BKG019", startDate: "2024-05-03", endDate: "2024-05-10", cost: 0, booked: true },
    { bookingId: "BKG020", startDate: "2024-05-10", endDate: "2024-05-17", cost: 480, booked: false },
    { bookingId: "BKG021", startDate: "2024-05-17", endDate: "2024-05-24", cost: 0, booked: true },
    { bookingId: "BKG022", startDate: "2024-05-24", endDate: "2024-05-31", cost: 0, booked: true },
    { bookingId: "BKG023", startDate: "2024-05-31", endDate: "2024-06-07", cost: 0, booked: true },
    { bookingId: "BKG024", startDate: "2024-06-07", endDate: "2024-06-14", cost: 0, booked: true },
    { bookingId: "BKG025", startDate: "2024-06-14", endDate: "2024-06-21", cost: 660, booked: false },
    { bookingId: "BKG026", startDate: "2024-06-21", endDate: "2024-06-28", cost: 0, booked: true },
    { bookingId: "BKG027", startDate: "2024-06-28", endDate: "2024-07-05", cost: 720, booked: false },
    { bookingId: "BKG028", startDate: "2024-07-05", endDate: "2024-07-12", cost: 0, booked: true },
    { bookingId: "BKG029", startDate: "2024-07-12", endDate: "2024-07-19", cost: 0, booked: true },
    { bookingId: "BKG030", startDate: "2024-07-19", endDate: "2024-07-26", cost: 0, booked: true },
    { bookingId: "BKG031", startDate: "2024-07-26", endDate: "2024-08-02", cost: 0, booked: true },
    { bookingId: "BKG032", startDate: "2024-08-02", endDate: "2024-08-09", cost: 0, booked: true },
    { bookingId: "BKG033", startDate: "2024-08-09", endDate: "2024-08-16", cost: 0, booked: true },
    { bookingId: "BKG034", startDate: "2024-08-16", endDate: "2024-08-23", cost: 0, booked: true },
    { bookingId: "BKG035", startDate: "2024-08-23", endDate: "2024-08-30", cost: 960, booked: false },
    { bookingId: "BKG036", startDate: "2024-08-30", endDate: "2024-09-06", cost: 650, booked: false },
    { bookingId: "BKG037", startDate: "2024-09-06", endDate: "2024-09-13", cost: 640, booked: false },
    { bookingId: "BKG038", startDate: "2024-09-13", endDate: "2024-09-20", cost: 550, booked: false },
    { bookingId: "BKG039", startDate: "2024-09-20", endDate: "2024-09-27", cost: 550, booked: false },
    { bookingId: "BKG040", startDate: "2024-09-27", endDate: "2024-10-04", cost: 0, booked: true },
    { bookingId: "BKG041", startDate: "2024-10-04", endDate: "2024-10-11", cost: 0, booked: true },
    { bookingId: "BKG042", startDate: "2024-10-11", endDate: "2024-10-18", cost: 540, booked: false },
    { bookingId: "BKG043", startDate: "2024-10-18", endDate: "2024-10-25", cost: 640, booked: false },
    { bookingId: "BKG044", startDate: "2024-10-25", endDate: "2024-11-01", cost: 640, booked: false },
    { bookingId: "BKG045", startDate: "2024-11-01", endDate: "2024-11-08", cost: 420, booked: false },
    { bookingId: "BKG046", startDate: "2024-11-08", endDate: "2024-11-15", cost: 420, booked: false },
    { bookingId: "BKG047", startDate: "2024-11-15", endDate: "2024-11-22", cost: 420, booked: false },
    { bookingId: "BKG048", startDate: "2024-11-22", endDate: "2024-11-29", cost: 420, booked: false },
    { bookingId: "BKG049", startDate: "2024-11-29", endDate: "2024-12-06", cost: 420, booked: false },
    { bookingId: "BKG050", startDate: "2024-12-06", endDate: "2024-12-13", cost: 420, booked: false },
    { bookingId: "BKG051", startDate: "2024-12-13", endDate: "2024-12-20", cost: 400, booked: false },
    { bookingId: "BKG052", startDate: "2024-12-20", endDate: "2024-12-27", cost: 650, booked: false },
    { bookingId: "BKG053", startDate: "2024-12-27", endDate: "2025-01-04", cost: 650, booked: false }
  ];

const defaultBookingData = {
    customerEmail: '',
    notes: '',
    paymentStatus: "pending",
    specialRequests: '',
    numberOfGuests: 0,
    pets: false,
    petsNotes: ''
  };
  
  function createFullBookingData(mockBooking) {
    return {
      ...defaultBookingData,
      ...mockBooking,
      type: 'booking',
      id: mockBooking.bookingId
    };
  }

const { CosmosClient } = require("@azure/cosmos");
const config = require("../config");

const endpoint = config.endpoint;
const key = config.key;
const databaseId = config.database.id;
const containerConfig = config.container.bookings;

const client = new CosmosClient({ endpoint, key });

async function uploadBookings() {
  for (const mockBooking of mockBookings) {
    const bookingData = createFullBookingData(mockBooking);
    try {
      const { resource: createdItem } = await client
        .database(databaseId)
        .container(containerConfig.id)
        .items.create(bookingData, { partitionKey: bookingData.bookingId });
      console.log(`Uploaded booking: ${bookingData.bookingId}`);
    } catch (error) {
      console.error(`Error uploading booking ${bookingData.bookingId}:`, error);
    }
  }
  console.log("Finished uploading bookings");
}

uploadBookings();
