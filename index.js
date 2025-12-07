require('dotenv').config();
const express = require("express");
const cors = require("cors");
const controller = require("./controller");

const app = express();

app.use(cors());

app.get('/', (req, res) => {
    res.status(200).json("Hello World from Express server!");
})

app.get('/feed-data', controller.feedData)
app.get('/students', controller.getStudents)

app.use((req, res, next) => {
    res.status(404).json({
        status: "error",
        message: "Route not found",
    });
});

app.use((err, req, res, next) => {
    console.error("Error:", err.message);
  
    res.status(err.status || 500).json({
      status: "error",
      message: err.message || "Internal Server Error",
    });
  });

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
})
