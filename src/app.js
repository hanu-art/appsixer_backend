import express from 'express';
import errorMiddleware from './middleware/error.middleware.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js';
import contactRouter from './routes/contact.routes.js';
import statusRouter from './routes/status.routes.js';
import counterRouter from './routes/counter.routes.js'; 
import jobDivaRouter from './routes/jobDiva.routes.js';
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // frontend
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
  })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cookieParser());
app.use('/api/auth', authRouter);
app.use('/api', contactRouter);
app.use('/api', statusRouter); 
app.use("/api" , counterRouter)
app.use("/api" , jobDivaRouter)
app.use(errorMiddleware);
export default app;