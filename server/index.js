const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('ClaimHero API is running');
});

const analyzeRoute = require('./routes/analyze');
app.use('/analyze-claim', analyzeRoute);

const appealsRoute = require('./routes/appeals');
app.use('/appeals', appealsRoute);

app.use('/analyze', require('./routes/analyze'));
app.use('/auth', require('./routes/auth'));
app.use('/email', require('./routes/email'));
app.use('/chat', require('./routes/chat'));


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
