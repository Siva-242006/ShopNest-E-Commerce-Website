const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors())
require('dotenv').config();

const mongoUri = process.env.MONGO_URI;
const port = process.env.PORT || 5000;

const fetchGeolocation = async (req, res, next) => {
  const clientIp = req.ip;

  if (clientIp === '::1' || clientIp === '127.0.0.1' || clientIp.startsWith('::ffff:127.0.0.1')) {
    req.location = {
      country: 'Localhost',
      city: 'Localhost',
      lat: null,
      lon: null,
    };
    console.log(`Request from IP: ${clientIp}, Location: Localhost`);
    return next();
  }

  try {
    const response = await fetch(`http://ip-api.com/json/${clientIp}`);
    
    const locationData = await response.json();
    if (!response.ok || locationData.status !== 'success') {
      throw new Error(`IP-API status: ${locationData.status}`);
    }

    req.location = {
      country: locationData.country,
      city: locationData.city,
      lat: locationData.lat,
      lon: locationData.lon,
    };
    // Log the request with the fetched location console   
    console.log(`Request from IP: ${clientIp}, Location: ${req.location.city}, ${req.location.country}`);

  } catch (error) {
    console.error(`Error fetching geolocation for IP ${clientIp}:`, error.message);
    req.location = null;
  }
  
  next();
};

app.use(fetchGeolocation);

const logRoutes = require("./routes/logRoute")
app.use(logRoutes)

const userRoutes = require("./routes/userRoutes")
app.use(userRoutes)

const productRoutes = require("./routes/productRoutes")
app.use(productRoutes)

app.use('/categories', require('./routes/categoryRoutes'));

const cartRoutes = require("./routes/cartRoutes")
app.use(cartRoutes)

const orderRoutes = require("./routes/ordersRoutes")
app.use(orderRoutes)

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
