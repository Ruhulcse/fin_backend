const express = require("express");
const app = express();
const cors = require("cors");
const routes = require("./routes");
const multer = require("multer");
const logger = require("./logger");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger-output.json");

require("dotenv").config();


// Multer storage configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
// app.use("/api", auth.authorize);
// app.use(logger("dev"));
// app.use(helmet());
app.use(routes);
app.use("/public", express.static("public"));

app.get("/", (req, res) => {
  res.send(createResponse(false, "Hello World!"));
});

// app.use(errorHandler);

app.all("*", (req, res) => {
  res.status(404).send(createResponse(true, "Not Found!"));
});






// Import Sequelize config and models
const db = require("./models");
const syncDatabase = async () => {
  try {
    await db.User.sync();
    await db.UserDetail.sync();
    await db.Measurement.sync();
    await db.Task.sync();
    await db.Workout.sync();
    await db.NutritionPlan.sync();
    await db.ResultTracking.sync();
    await db.Exercise.sync();
    await db.Training.sync();
    console.log("Database synced");
  } catch (error) {
    console.error("Error syncing database:", error);
  }
};
syncDatabase();

// Sync models to ensure database is up-to-date
db.sequelize.sync({ alter: true }).then(() => {
  console.log("Database synced");
});
// General logging middleware to log all requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});




// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`server listening on http://127.0.0.1:${PORT}`);
});