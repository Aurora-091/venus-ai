import mongoose from "mongoose";

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn("[server] MONGODB_URI is not set. Using in-memory demo storage.");
    return false;
  }

  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("[server] MongoDB connected");
    return true;
  } catch (error) {
    console.warn("[server] MongoDB connection failed. Using in-memory demo storage.");
    console.warn(error.message);
    return false;
  }
}
