const mongoose = require("mongoose");

const DataBase = async () => {
  try {
    const connection = await mongoose.connect(process.env.DB_URL);
    console.log(`🗄️ MongoDB connected to: -> ${connection.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = DataBase;
