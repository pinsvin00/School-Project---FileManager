const express = require("express");
const app = express();
const path = require("path");
const port = 3000;
const bodyParser = require("body-parser");
const multer = require("multer");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); //Appending extension
  },
});

const upload = multer({ storage: storage });

app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  if (req.body.password === "123" && req.body.login === "123") {
    loggedIn = true;
    return res.render("index.hbs");
  }
  if (!loggedIn) {
    return res.render("login");
  }
  next();
});

const hbs = require("express-handlebars");
const { ReadStream } = require("fs");

const files = [];

app.set("views", path.join(__dirname, "views")); // ustalamy katalog views
app.engine("hbs", hbs({ defaultLayout: "main.hbs" })); // domyślny layout, potem można go zmienić
app.set("view engine", "hbs");
let loggedIn = false;
app.get("/", (req, res) => {
  res.render("index.hbs");
});

app.get("/download/:name", (req, res) => {
  const file = __dirname + "/uploads/" + req.params.name;
  res.download(file);
});

app.get("/delete/:id", (req, res) => {
  const index = files.findIndex((el) => el.id == req.params.id);
  if (index !== -1) {
    files.splice(index, 1);
  }
  res.render("list", { files });
});

app.get("/info/:id", (req, res) => {
  res.render("info", { file: files.find((el) => el.id == req.params.id) });
});

app.get("/delete_all", (req, res) => {
  files.splice(0, files.length);
  res.render("list", { files });
});

app.get("/upload", (req, res) => {
  res.render("index.hbs");
});

const imageUrl = {
  "text/javascript":
    "https://raw.githubusercontent.com/voodootikigod/logo.js/master/js.png",
};

const notMapped =
  "https://i.pinimg.com/originals/d0/78/22/d078228e50c848f289e39872dcadf49d.png";
app.post("/upload", upload.array("files", 12), (req, res) => {
  req.files.forEach((el) => {
    const splitted = el.path.split("/");
    const name = splitted.pop();
    files.push({
      id: files.length,
      orginalName: el.originalname,
      name: name,
      image:
        imageUrl[el.mimetype] !== undefined ? imageUrl[el.mimetype] : notMapped,
      type: el.mimetype,
      path: el.path,
      size: el.size,
    });
    console.log("added");
  });
  res.render("index.hbs");
});

app.get("/list", (req, res) => {
  console.log(files);
  res.render("list", { files });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
