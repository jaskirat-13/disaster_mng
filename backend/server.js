const express = require('express');
const axios = require('axios');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();
const port = 3000;
const server = http.createServer(app);
const io = socketIO(server);

require('dotenv').config();

app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

// app.get("/", (req, res) => {
//     res.sendFile(__dirname + "/views/index.html")
// })

let connectedUsers = [];

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Replace with your actual password or use environment variables
    },
});

// Function to send an email alert for flood
const sendFloodEmailAlert = (location, rainAmount, latitude, longitude) => {
    const mapUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=10`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'gauravjio50@gmail.com',
        subject: `Flood Alert: Water Logging in ${location}`,
        html: `<p>Alert: Water logging has been detected in ${location}. Rainfall: ${rainAmount}mm in the last hour.</p>
               <p>View the affected area on the map: <a href="${mapUrl}" target="_blank">OpenStreetMap</a></p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

// Function to send an email alert for earthquake
const sendEarthquakeEmailAlert = (location, magnitude, latitude, longitude) => {
    const mapUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=10`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'gauravjio50@gmail.com',
        subject: `Earthquake Alert: Earthquake detected in ${location}`,
        html: `<p>Alert: An earthquake with magnitude ${magnitude} has been detected near ${location}. Please take immediate action.</p>
               <p>View the affected area on the map: <a href="${mapUrl}" target="_blank">OpenStreetMap</a></p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

// Function to send an email alert for hurricane
const sendHurricaneEmailAlert = (location, latitude, longitude) => {
    const mapUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=10`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'gauravjio50@gmail.com',  // Replace with actual municipal corporation email
        subject: `Hurricane Alert: Hurricane detected near ${location}`,
        html: `<p>Alert: A hurricane has been detected near ${location}. Please take immediate action and issue necessary warnings.</p>
               <p>View the affected area on the map: <a href="${mapUrl}" target="_blank">OpenStreetMap</a></p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending hurricane alert email:', error);
        } else {
            console.log('Hurricane alert email sent:', info.response);
        }
    });
};

// Function to send an email alert for drought
const sendDroughtEmailAlert = (location, rainfall, humidity, temperature, latitude, longitude) => {
    const mapUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=10`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'gauravjio50@gmail.com',
        subject: `Drought Alert: Drought detected in ${location}`,
        html: `<p>Alert: Drought conditions detected in ${location}. Rainfall: ${rainfall}mm, Humidity: ${humidity}%, Temperature: ${temperature}°C. Immediate action is required.</p>
               <p>View the affected area on the map: <a href="${mapUrl}" target="_blank">OpenStreetMap</a></p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

// Route to check flood status
app.get('/check-flood', async (req, res) => {
    const location = req.query.location;
    try {
        const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=f6301c73e4938f20493c13b317cbd421`;
        const response = await axios.get(weatherApiUrl);
        const weatherData = response.data;

        const rainInLastHour = weatherData.rain && weatherData.rain['1h'] ? weatherData.rain['1h'] : 0;
        const isFlooded = rainInLastHour > 0.0000000001;
        const latitude = weatherData.coord.lat;
        const longitude = weatherData.coord.lon;

        io.emit('floodUpdate', { location, isFlooded });

        if (isFlooded) {
            sendFloodEmailAlert(location, rainInLastHour, latitude, longitude);
        }

        res.json({ isFlooded });
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({ error: 'Failed to fetch flood data.' });
    }
});

// Route to check earthquake status
app.get('/check-earthquake', async (req, res) => {
    try {
        const earthquakeApiUrl = 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=now-1hour';
        const response = await axios.get(earthquakeApiUrl);
        const earthquakeData = response.data;

        const recentEarthquake = earthquakeData.features[0]; // Assuming the first feature is the most recent earthquake
        const location = recentEarthquake.properties.place;
        const magnitude = recentEarthquake.properties.mag;
        const latitude = recentEarthquake.geometry.coordinates[1];
        const longitude = recentEarthquake.geometry.coordinates[0];

        const isEarthquake = magnitude >= 1; // Set a threshold for significant earthquakes

        io.emit('earthquakeUpdate', { location, magnitude, isEarthquake });

        if (isEarthquake) {
            sendEarthquakeEmailAlert(location, magnitude, latitude, longitude);
        }

        res.json({ location, magnitude, isEarthquake });
    } catch (error) {
        console.error('Error fetching earthquake data:', error);
        res.status(500).json({ error: 'Failed to fetch earthquake data.' });
    }
});

// Route to check hurricane status
app.get('/check-hurricane', async (req, res) => {
    const location = req.query.location;
    try {
        const hurricaneApiUrl = `https://api.weatherapi.com/v1/current.json?key=baa37b6a79d54894ac3220400241709&q=${encodeURIComponent(location)}&alerts=yes`;
        const response = await axios.get(hurricaneApiUrl);
        const weatherData = response.data;

        if (weatherData.alerts && weatherData.alerts.alert) {
            const hurricaneAlert = weatherData.alerts.alert;
            const latitude = weatherData.location.lat;
            const longitude = weatherData.location.lon;

            io.emit('hurricaneUpdate', { location, hurricaneAlert });

            sendHurricaneEmailAlert(location, latitude, longitude);
            res.json({ isHurricane: true, hurricaneAlert });
        } else {
            res.json({ isHurricane: false, message: 'No hurricane alerts for this location.' });
        }
    } catch (error) {
        console.error('Error fetching hurricane data:', error);
        res.status(500).json({ error: 'Failed to fetch hurricane data.' });
    }
});

// Route to check drought status
app.get('/check-drought', async (req, res) => {
    const location = req.query.location;

    try {
        const weatherApiUrl = `https://api.weatherapi.com/v1/current.json?key=baa37b6a79d54894ac3220400241709&q=${location}`;
        const response = await axios.get(weatherApiUrl);
        const weatherData = response.data;

        const rainfall = weatherData.current.precip_mm;  // Rainfall in mm
        const humidity = weatherData.current.humidity;   // Humidity in percentage
        const temperature = weatherData.current.temp_c;  // Temperature in Celsius
        const latitude = weatherData.location.lat;
        const longitude = weatherData.location.lon;

        const isDrought = rainfall < 2 && temperature > 35 && humidity < 30;

        io.emit('droughtUpdate', { location, isDrought });

        if (isDrought) {
            sendDroughtEmailAlert(location, rainfall, humidity, temperature, latitude, longitude);
        }

        res.json({ isDrought });
    } catch (error) {
        console.error('Error fetching drought data:', error);
        res.status(500).json({ error: 'Failed to fetch drought data.' });
    }
});



io.on('connection', (socket) => {
    connectedUsers.push(socket);
    console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
        connectedUsers = connectedUsers.filter(user => user !== socket);
        console.log('A user disconnected:', socket.id);
    });
});

server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});