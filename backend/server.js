require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api'); // Import the new router
const authRoutes = require('./routes/auth'); // Import auth routes

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Use the API routes
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes); // Add this line

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
}); 