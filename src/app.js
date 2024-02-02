const express = require("express");
const mongoose = require("mongoose");
const Customer = require("./models/customer");
const User = require("./models/user");
const cors = require("cors");

const app = express();
mongoose.set("strictQuery", false);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const PORT = process.env.PORT || 3000;
const CONNECTION = process.env.CONNECTION;

if (!CONNECTION) {
  console.error();
  process.exit(1);
}

app.get("/:mail", async (req, res) => {
  try {
    const { mail } = req.params;
    const user = await User.findOne({ mail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

app.post("/users", async (req, res) => {
  try {
    const { name, mail, phone, pswd } = req.body;

    if (!name || !mail || !phone || !pswd) {
      return res.status(400).send({
        message: "All required fields must be provided.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(mail)) {
      return res.status(400).send({
        message: "Invalid email format.",
      });
    }
    console.log(req.body);
    const hashedPassword = await bcrypt.hash(pswd, 10);

    const newUser = {
      name,
      mail,
      phone,
      pswd: hashedPassword,
    };

    const user = await User.create(newUser);

    return res.status(201).send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
});

app.get("/", async (req, res) => {
  try {
    const user = await User.find({});

    if (!user) {
      return res.status(404).json({ message: "Users not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

const start = async () => {
  try {
    await mongoose.connect(CONNECTION);
    app.listen(PORT, () => {
      console.log("App listening on port " + PORT);
    });
  } catch (e) {
    console.log(e.message);
  }
};

start();
