import express from 'express';
import 'dotenv/config';
import connectDB from './src/config/db.js';

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello !');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
