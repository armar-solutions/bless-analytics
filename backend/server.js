const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api'); // Import the new router

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Use the API routes
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
}); 