const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3002;

app.use(bodyParser.json());

app.post("webook", (req, res) => {
  console.log(req.body);
  res.send("ok");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
