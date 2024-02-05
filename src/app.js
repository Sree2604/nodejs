const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const path = require('path');


const app = express();
mongoose.set("strictQuery", false);

app.use(cors());
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const PORT = process.env.PORT || 3000;
const CONNECTION = process.env.CONNECTION;

if (!CONNECTION) {
  console.error("Connection string is not provided.");
  process.exitCode = 1;
  process.exit();
}

app.use((err, req, res, next) => {
  console.error(err.message);

  if (err instanceof mongoose.Error.ValidationError) {
    return res
      .status(400)
      .json({ message: "Validation Error", error: err.errors });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(404).json({ message: "Resource not found" });
  }

  res.status(500).json({ message: "Internal Server Error" });
});

app.use("/users", userRoutes);
app.use("/products", productRoutes);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const start = async () => {
  try {
    await mongoose.connect(CONNECTION, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`App listening on port ${PORT}`);
    });
  } catch (e) {
    console.error("Error connecting to the database:", e.message);
    process.exitCode = 1;
    process.exit();
  }

  process.on("SIGINT", () => {
    mongoose.connection.close(() => {
      console.log("MongoDB disconnected through app termination");
      process.exit(0);
    });
  });
};

start();
