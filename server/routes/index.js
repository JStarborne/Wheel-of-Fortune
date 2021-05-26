const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res
    .send({ response: 1, name: "Wheel of Fortune", author: "Jessie Starborne" })
    .status(200);
});

module.exports = router;
