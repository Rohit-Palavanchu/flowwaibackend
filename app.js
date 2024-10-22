const express = require('express');
const cors = require('cors');

const transactionRoute = require('./routes/transactionRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/transaction', transactionRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
