const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const cron = require('node-cron');

const app = express();
const port = 9001;

const moment = require('moment-timezone');

// MongoDB connection
//mongoose.connect('mongodb://localhost:27017/weatherDB', {
    mongoose.connect('mongodb://0.0.0.0:27017/weatherDB', {  
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const WeatherData = mongoose.model('WeatherData', {
  
  responsedata: String,
  timestamp: { type: Date, default: Date.now },
});

// Function to get the current time in Korea
const getCurrentTimeInKorea = () => {
  //return moment.tz('Asia/Seoul').format('YYYYMMDD HHmm'); // Adjust the timezone accordingly
  return moment.tz('Asia/Seoul').subtract(1, 'hours').format('YYYYMMDD HHmm'); // Adjust the timezone accordingly
};


// OpenWeatherMap API key
const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY';
const city = 'YOUR_CITY_NAME';

// Function to fetch weather data from the API
const fetchWeatherData = async () => {
  try {
   // Get the current time in Korea
   const currentTimeInKorea = getCurrentTimeInKorea();

   // Use the current time to construct base_date and base_time
   const base_date = currentTimeInKorea.substring(0, 8);
   const base_time = currentTimeInKorea.substring(9);

   // Construct the API URL with the current time
   const apiUrl = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=WLm8yF801DZP%2FnyNRjzZxFL1FugM0JS%2FJxo35T927rUJTTkWqV57Q2UjLQGgKPHsRG6VsKJlxEGJQBSwKNggbg%3D%3D&pageNo=1&numOfRows=1000&dataType=XML&base_date=${base_date}&base_time=${base_time}&nx=55&ny=127`;

   // Make the axios.get request
   const response = await axios.get(apiUrl);

   // Save data to MongoDB
   const weatherData = new WeatherData({ responsedata: response.data });
   await weatherData.save();

   console.log('Weather data fetched and saved:', weatherData);
 } catch (error) {
   console.error('Error fetching weather data:', error.message);
 }
};

// Schedule the job to fetch weather data every hour (you can adjust the cron schedule as needed)
cron.schedule('*/10 * * * *', fetchWeatherData);
//cron.schedule('* * * * * *', fetchWeatherData);

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
