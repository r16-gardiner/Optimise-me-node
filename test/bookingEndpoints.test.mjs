// import * as chai from 'chai';
// import chaiHttp from 'chai-http';

// import app from '../app.js';

// chai.use(chaiHttp);  // Use chaiHttp plugin before using chai.request

// const agent = chai.request(app);  // Create a request agent for your app

// describe('Booking API Endpoints', () => {
//   let testBookingId = 'TEST001';

//   it('should create a new booking', (done) => {
//     agent
//       .post('/bookings')
//       .send({
//         bookingId: testBookingId,
//         // ... rest of your booking data
//       })
//       .end((err, res) => {
//         expect(res).to.have.status(201);
//         expect(res.body).to.have.property('bookingId', testBookingId);
//         done();
//       });
//   });

//   it('should retrieve all bookings', (done) => {
//     chai.request(app)
//       .get('/bookings')
//       .end((err, res) => {
//         expect(res).to.have.status(200);
//         expect(res.body).to.be.an('array');
//         done();
//       });
//   });

//   it('should retrieve a booking by ID', (done) => {
//     chai.request(app)
//       .get(`/bookings/${testBookingId}`)
//       .end((err, res) => {
//         expect(res).to.have.status(200);
//         expect(res.body).to.have.property('bookingId', testBookingId);
//         done();
//       });
//   });

//   it('should update a booking', (done) => {
//     chai.request(app)
//       .put(`/bookings/${testBookingId}`)
//       .send({
//         bookingId: testBookingId,
//         startDate: '2023-12-29',
//         endDate: '2024-01-05',
//         cost: 650,
//         booked: true,
//         customerId: 'CUST001',
//         customerEmail: 'test@example.com',
//         notes: 'Updated test booking'
//       })
//       .end((err, res) => {
//         expect(res).to.have.status(200);
//         expect(res.body).to.have.property('cost', 650);
//         expect(res.body).to.have.property('booked', true);
//         done();
//       });
//   });

//   it('should delete a booking', (done) => {
//     chai.request(app)
//       .delete(`/bookings/${testBookingId}`)
//       .end((err, res) => {
//         expect(res).to.have.status(204);
//         done();
//       });
//   });
// });
