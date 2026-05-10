const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(express.json());

const Port = process.env.port;

const RunApp = async () => {
  try {
    app.listen(Port, () => {
      console.log(`🌐 Server Running on Port: ${Port}`);
    });
  } catch (error) {
    console.error(`App failed to run ${error.message}`);
  }
};

RunApp();
