const mongoose = require("mongoose");


const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/epikindifi");
    console.log("MongoDB connected");
    
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });
    
    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });
    
    // mongoose.set("debug", true);

    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed on app termination");
      process.exit(0);
    });

    return mongoose

  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }
};

module.exports = { connectDB };
