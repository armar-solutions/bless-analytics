require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api'); // Import the new router

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // for parsing application/json

// Use the API routes
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
}); 