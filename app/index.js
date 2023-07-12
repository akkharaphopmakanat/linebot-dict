const express = require("express");
const lineController = require("./lineController");
const app = express();

app.use("/line", lineController);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Listening on Port ${port}`);
});
