
// import { Model, Schema } from "mongoose";
// import Database from "../../core/database";
// import User from "../../mongoose/models/Users";
// import { mockUser } from "../../tests/data/users/UserMock";

// const { DATABASE_URI = "mongodb://localhost:27017/farmiz" } = process.env;

// async function collectionSeedGenerator<T>(
//   model: Model<T>,
//   numberOfRecords: number,
// ) {
//   try {
//     await Database.start(DATABASE_URI);

//     await mockUser.createMany(numberOfRecords);
//   } catch (error) {
//     console.info({ msg: error.message });
//   } finally {
//     process.exit(0);
//   }
// }
// collectionSeedGenerator(User, 100);
