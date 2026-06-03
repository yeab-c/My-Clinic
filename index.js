import express from 'express';
import 'dotenv/config';
import cors from 'cors';

import connectDB from './src/config/db.js';

import userRouter from './src/routes/user.route.js';
import doctorRouter from './src/routes/doctor.route.js';
import availabilityRouter from './src/routes/availability.route.js';
import appointmentRouter from './src/routes/appointment.route.js';

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

app.use("/api/users", userRouter);
app.use("/api/doctors", doctorRouter);
app.use("/api/availability", availabilityRouter);
app.use("/api/appointments", appointmentRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
