const express = require('express');
const router = express.Router();
const bookingService = require('./Booking'); // Adjust the path as necessary

// Total Bookings Endpoint
router.get('/total-bookings', async (req, res) => {
  const year = parseInt(req.query.year, 10);
  console.log('GET /total-bookings endpoint hit');
  try {
    const totalBookings = await bookingService.getTotalBookings(isNaN(year) ? undefined : year);
    console.log('Total Bookings:', totalBookings);
    res.status(200).json({ totalBookings });
  } catch (error) {
    console.error("Error in /total-bookings:", error);
    res.status(500).json({ error: error.message });
  }
});
router.get('/bookings-by-year/:year', async (req, res) => {
  try {
      const year = parseInt(req.params.year, 10);
      if (isNaN(year) || year < 1000 || year > 9999) {
          return res.status(400).json({ error: "Invalid year provided" });
      }
      const bookings = await bookingService.getBookingsByYear(year);
      res.status(200).json(bookings);
  } catch (error) {
      console.error("Error in /bookings-by-year:", error);
      res.status(500).json({ error: error.message });
  }
});
router.get('/payment-status-count', async (req, res) => {
  const year = parseInt(req.query.year, 10);
  console.log('GET /payment-status-count endpoint hit');
  try {
    const paymentStatusCounts = await bookingService.getPaymentStatusCounts(isNaN(year) ? undefined : year);
    console.log('Payment Status Counts:', paymentStatusCounts);
    res.status(200).json(paymentStatusCounts);
  } catch (error) {
    console.error("Error in /payment-status-count:", error);
    res.status(500).json({ error: error.message });
  }
});
// Total Revenue Endpoint
router.get('/total-revenue', async (req, res) => {
  const year = parseInt(req.query.year, 10);
  console.log('GET /total-revenue endpoint hit');
  try {
    const totalRevenue = await bookingService.getTotalRevenue(isNaN(year) ? undefined : year);
    console.log('Total Revenue:', totalRevenue);
    res.status(200).json({ totalRevenue });
  } catch (error) {
    console.error("Error in /total-revenue:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const bookings = await bookingService.getBookings();
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sfec', async (req, res) => {
  try {
    const bookings = await bookingService.getCurrentYearBookingsShort();
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const booking = await bookingService.getBooking(req.params.id);
    res.status(200).json(booking);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    // Parse number fields from strings to appropriate types
    req.body.weeklyPrice = parseFloat(req.body.weeklyPrice);
    req.body.deposit = parseFloat(req.body.deposit);
    req.body.final = parseFloat(req.body.final);
    req.body.totalPaid = parseFloat(req.body.totalPaid);
    req.body.numberOfGuests = parseInt(req.body.numberOfGuests, 10);

    const booking = await bookingService.createBooking(req.body);
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Apply similar parsing in the PUT route if necessary
router.put('/:id', async (req, res) => {
  try {
    req.body.weeklyPrice = parseFloat(req.body.weeklyPrice);
    req.body.deposit = parseFloat(req.body.deposit);
    req.body.final = parseFloat(req.body.final);
    req.body.totalPaid = parseFloat(req.body.totalPaid);
    req.body.numberOfGuests = parseInt(req.body.numberOfGuests, 10);

    const booking = await bookingService.updateBooking(req.params.id, req.body);
    res.status(200).json(booking);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    await bookingService.deleteBooking(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.get('/bookings-by-date', async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    const bookings = await bookingService.getBookingsByDateRange(startDate, endDate);
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/frequent-customers', async (req, res) => {
  try {
    const customers = await bookingService.getFrequentCustomers();
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.patch('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    // Fetch the current state of the booking
    const currentBooking = await bookingService.getBooking(id);
    if (!currentBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Update only the fields that were passed in the request body
    const updatedBooking = { ...currentBooking, ...updates };

    // Validate or convert data as necessary
    if (updates.weeklyPrice) updatedBooking.weeklyPrice = parseFloat(updates.weeklyPrice);
    if (updates.deposit) updatedBooking.deposit = parseFloat(updates.deposit);
    if (updates.final) updatedBooking.final = parseFloat(updates.final);
    if (updates.totalPaid) updatedBooking.totalPaid = parseFloat(updates.totalPaid);
    if (updates.numberOfGuests) updatedBooking.numberOfGuests = parseInt(updates.numberOfGuests, 10);

    // Save the updated booking
    const result = await bookingService.updateBooking(id, updatedBooking);
    res.status(200).json(result);
  } catch (error) {
    console.error("Failed to update booking:", error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
