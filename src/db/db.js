import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
  try {
    const mongoURI = process.env.DB_URI;
    if (!mongoURI) {
      console.log("MongoDB uri is not configured");
      process.exit(1);
    }
    const connectionInstance = await mongoose.connect(`${mongoURI}/${DB_NAME}`);
    console.log(
      `MongoDB is connected successfully!! DB host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log(`MONGODB CONNECTION FAILED DUE TO: `, error);
    process.exit(1);
  }
};

export {connectDB};
