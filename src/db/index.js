// whole purpose of this file is to have a DB connection

import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

//connect to db
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\n MongoDB connected ! DB Host : ${connectionInstance.connection.host}`
    );
    //console.log(`\n MongoDB connected ! DB Host : ${connectionInstance}`);
  } catch (error) {
    console.log("MongoDB connection error", error);
    process.exit(1); // exit , don't proceed further
  }
};

export default connectDB;
