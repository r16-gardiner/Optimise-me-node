const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors'); // Add this line
const cosmosClient = require('./routes/cosmosClient');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const getDailyPlan = require('./routes/dailyPlan');
const updateDailyPlan = require('./routes/updateDailyPlan');
const aggregateTimeByType = require('./routes/timeByType')
const app = express();
const PostPhoneHabit = require('./routes/Habits');
const dailyUpdate = require('./routes/PhoneDailyAlert')
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors()); // Use CORS middleware to allow all origins



app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/getHabitForCurrentTime',dailyUpdate),
// Mount your custom route at the desired path
app.use('/daily-plan', getDailyPlan);

app.use('/update-daily-plan', updateDailyPlan);
app.use('/timetable-summary', aggregateTimeByType);
app.use('/logHabitPhone', PostPhoneHabit);

app.post('/logHabit', async (req, res) => {
  try {
    console.log(req.body); // Log the request body for debugging
    if (!Array.isArray(req.body)) { // Check if req.body is an array
      throw new Error('Habits data is not in expected format (array)');
    }
    await cosmosClient.logHabitData(req.body);
    res.status(200).send('Habits logged successfully');
  } catch (error) {
    console.error('Error in logHabit:', error);
    res.status(500).send('Error logging habits: ' + error.message);
  }
});





app.get('/getHabits', async (req, res) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const habits = await cosmosClient.getHabitData(startDate, endDate);
    res.status(200).json(habits);
  } catch (error) {
    console.error('Error in getHabits:', error);
    res.status(500).send('Error retrieving habits');
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
