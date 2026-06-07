const express = require("express");

const router = express.Router();

const authRoute = require("./authRoute");
const catRoute = require("./categoryRoute");
const productRoute = require("./productRoute");

router.get("/", (req, res) => {
  res.status(200).send("Hello from server");
});

router.use("/auth", authRoute);
router.use("/categorylist", catRoute);
router.use("/product", productRoute);

module.exports = router;
