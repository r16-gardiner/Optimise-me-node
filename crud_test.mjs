import axios from 'axios';

const baseURL = 'http://localhost:8888';

async function testBookings() {
  const bookingData = {
    startDate: '2023-12-29',
    endDate: '2024-01-05',
    cost: 600,
    booked: false,
    customerEmail: 'test@example.com',
    notes: 'Test booking', 
    paymentStatus: "pending",
    specialRequests: "Need a baby crib",
    numberOfGuests: 2,
    pets: true,
    petsNotes: 'one large dog, one small spaniel.'
  };

  try {
    console.log('Creating Booking...');
    console.log('sassasa')
    const createResponse = await axios.post(`${baseURL}/bookings`, bookingData);
    const createdBooking = createResponse.data;
    console.log('Create Booking Response:', createdBooking);

    const { bookingId } = createdBooking;

    console.log('Getting All Bookings...');
    const allBookingsResponse = await axios.get(`${baseURL}/bookings`);
    console.log('Get All Bookings Response:', allBookingsResponse.data);

    console.log('Getting Booking By ID...');
    const getBookingByIdResponse = await axios.get(`${baseURL}/bookings/${bookingId}`);
    console.log('Get Booking By ID Response:', getBookingByIdResponse.data);

    console.log('Updating Booking...');
    const updatedBookingData = { ...createdBooking, cost: 650, booked: true, notes: 'Updated test booking' };
    const updateBookingResponse = await axios.put(`${baseURL}/bookings/${bookingId}`, updatedBookingData);
    console.log('Update Booking Response:', updateBookingResponse.data);

    console.log('Getting Booking By ID After Update...');
    const getBookingByIdAfterUpdateResponse = await axios.get(`${baseURL}/bookings/${bookingId}`);
    console.log('Get Booking By ID Response:', getBookingByIdAfterUpdateResponse.data);

    console.log('Deleting Booking...');
    await axios.delete(`${baseURL}/bookings/${bookingId}`);
    console.log('Delete Booking Response:');

    console.log('Getting All Bookings After Deletion...');
    const allBookingsAfterDeletionResponse = await axios.get(`${baseURL}/bookings`);
    console.log('Get All Bookings Response:', allBookingsAfterDeletionResponse.data);
  } catch (error) {
    console.error('Test failed:', error.response ? error.response.data : error.message);
  }
}

testBookings();
