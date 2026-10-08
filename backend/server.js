const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
require('dotenv').config();

const productRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Sync MySQL Database
sequelize.sync().then(() => {
    console.log('MySQL Database synced');
}).catch((err) => {
    console.log('Error syncing database: ', err);
});

// Routes
app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
  res.json({ message: "PlaycasthubAI API is running!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
