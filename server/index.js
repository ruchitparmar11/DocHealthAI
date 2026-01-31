const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const router = express.Router();

router.get('/', (req, res) => {
    res.send('ClaimHero API is running');
});

const analyzeRoute = require('./routes/analyze');
router.use('/analyze-claim', analyzeRoute);

const appealsRoute = require('./routes/appeals');
router.use('/appeals', appealsRoute);

router.use('/analyze', require('./routes/analyze'));
router.use('/auth', require('./routes/auth'));
router.use('/email', require('./routes/email'));
router.use('/chat', require('./routes/chat'));

// Mount router for both local and Vercel paths
app.use('/api', router);
app.use('/', router);


if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
