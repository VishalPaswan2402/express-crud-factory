import mongoose from "mongoose";

export async function connectDatabase(db_url) {
    if (!db_url) {
        throw new Error("Database URL is required");
    }
    try {
        await mongoose.connect(db_url);
        console.log("MongoDB connected successfully");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        throw err;
    }
};