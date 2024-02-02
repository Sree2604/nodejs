const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/user");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
mongoose.set("strictQuery", false);

app.use(cors());
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const PORT = process.env.PORT ?? 3000;
const CONNECTION = process.env.CONNECTION;

if (!CONNECTION) {
  console.error("Connection string is not provided.");
  process.exitCode = 1;
  process.exit();
}

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).send({ message: "Internal Server Error" });
});

const router = express.Router();

router.get("/:mail", async (req, res, next) => {
  try {
    const { mail } = req.params;
    const user = await User.findOne({ mail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

router.post("/register", async (req, res, next) => {
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
    next(error);
  }
});

app.use("/", router);

const start = async () => {
  try {
    await mongoose.connect(CONNECTION);
    app.listen(PORT, () => {
      console.log("App listening on port " + PORT);
    });
  } catch (e) {
    console.error("Error connecting to the database:", e.message);
    process.exitCode = 1;
    process.exit();
  }
};

start();
