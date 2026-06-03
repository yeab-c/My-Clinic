import express from 'express';
import 'dotenv/config';
import cors from 'cors';

import connectDB from './src/config/db.js';

import userRoutes from './src/routes/user.route.js';


const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MyClinic API is running",
  });
});

app.use("/api/users", userRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
