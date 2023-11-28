import dotenv from "dotenv";
dotenv.config();
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from "mongoose";
import { app } from "./app";

let mongooseMemoryServer: MongoMemoryServer;

before(async () => {
  try {
    mongooseMemoryServer = await MongoMemoryServer.create();
    const dbUri = await mongooseMemoryServer.getUri();
    await mongoose.connect(dbUri);
    await app.start(3983);
  } catch (error: any) {
    console.debug("ERROR", error.message);
  }
});

after(async () => {
  await mongooseMemoryServer.stop();
  await mongoose.disconnect();
});
