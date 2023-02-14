require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");

// Traer BODY PARSER

const bodyParser = require("body-parser");

// SCHEMA URL

const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number,
});

// MODEL URL

const Url = mongoose.model("Url", urlSchema);

// MONGOOSE URL

const mongoUrl =
  "mongodb+srv://admin:" +
  process.env.PASS +
  "@cluster0.tdww8t6.mongodb.net/?retryWrites=true&w=majority";

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

// MIDDELWARE BODY PARSER

app.use(bodyParser.urlencoded({ extended: false }));

//

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

// Armado de POST

app.post("/api/shorturl", async (req, res) => {
  await mongoose
    .connect(mongoUrl)
    .then(async () => {
      const urlRegEx = "^(http)(s)*://(www.)*[0-9a-zA-Z]+(.com)*(.[a-zA-Z]+)*$";

      if (req.body.url.match(urlRegEx)) {
        const totalEntries = await Url.estimatedDocumentCount();
        const newUrl = new Url({
          original_url: req.body.url,
          short_url: totalEntries + 1,
        });
        await newUrl.save();
        res.json({ original_url: req.body.url, short_url: totalEntries + 1 });
      } else {
        res.json({ error: "Invalid URL" });
      }
    })
    .catch((err) => console.log(err));
});

// Armado de GET

app.get("/api/shorturl/:urlNumber", async (req, res) => {
  await mongoose
    .connect(mongoUrl)
    .then(async () => {
      const urlObject = await Url.findOne({ number: req.params.urlNumber });
      console.log(urlObject);
      res.redirect(urlObject.original_url);
    })
    .catch((err) => console.log(err));
});

//

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
