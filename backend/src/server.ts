import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import connectDB from './config/db';
import setupSocket from './socket';

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

// Pass IO to requests if needed, but it's better to store it or export it
app.set('io', io);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

// Routes will be imported and used here
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Setup Socket
setupSocket(io);

const PORT = process.env.PORT || 5000;
const serverInstance = server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful Shutdown Handler
const gracefulShutdown = () => {
  console.log('Received kill signal, shutting down gracefully');
  serverInstance.close(() => {
    console.log('Closed out remaining connections');
    mongoose.connection.close(false).then(() => {
      console.log('MongoDb connection closed.');
      process.exit(0);
    });
  });

  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
