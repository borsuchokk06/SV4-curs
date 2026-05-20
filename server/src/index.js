import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app.js';
import { connectDB, sequelize } from './config/database.js';
import './models/index.js';

const PORT = Number(process.env.PORT) || 4000;

async function main() {
  await connectDB();
  await sequelize.sync(); // alter:false — use seed script for fresh tables
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
