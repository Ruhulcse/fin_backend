const db = require("../models");
const logger = require("../logger");
const { createResponse } = require("../utils/responseGenerate");
const { getUrl } = require("../middlewares/s3Upload");
const { data } = require("../logger");

// Define the tracking route
module.exports.createMeasurement = async (req, res, next) => {
  const {
    user_id,
    date,
    weight,
    body_fat_percentage,
    chest,
    waist,
    thighr,
    thighl,
    armr,
    arml,
  } = req.body;
  const photos = req.files;

  try {
    // Replace direct SQL query with Sequelize create method
    const newMeasurement = await db.Measurement.create({
      user_id,
      date,
      weight,
      body_fat_percentage,
      chest,
      waist,
      thighr,
      thighl,
      armr,
      arml,
      photo1: photos[0]?.filename,
      photo2: photos[1]?.filename,
      photo3: photos[2]?.filename,
      photo4: photos[3]?.filename,
    });

    logger.info("New measurement added successfully");

    // Update task status if task_id is provided
    if (req.body.task_id) {
      logger.debug("Updating task status to Finish", req.body.task_id);
      await db.Task.update(
        { task_status: "Finish" },
        { where: { task_id: req.body.task_id } }
      );
    }

    res.json(
      createResponse(newMeasurement, "New measurement added successfully")
    );
  } catch (error) {
    logger.error("Error inserting new measurement:", error);
    next(error);
  }
};

// Define the get tracking metrics for a user route
module.exports.getTrackingBYUserID = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const measurements = await db.Measurement.findAll({
      where: { user_id: userId },
    });
    res.json(createResponse(measurements, "Measurement successfully retrive."));
  } catch (error) {
    logger.error(
      "Error fetching tracking metrics for user ID:",
      userId,
      error.message
    );
    // res.status(500).json({ error: error.message });
    next(error);
  }
};

// Define the get latest measurement for a user route
module.exports.getMeasurementBYUserID = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const latestMeasurement = await db.Measurement.findOne({
      where: { user_id: userId },
      order: [["date", "DESC"]],
    });
    if (latestMeasurement.photo1) {
      latestMeasurement.photo1 = await getUrl(latestMeasurement.photo1);
    }
    if (latestMeasurement.photo2) {
      latestMeasurement.photo2 = await getUrl(latestMeasurement.photo2);
    }
    if (latestMeasurement.photo3) {
      latestMeasurement.photo3 = await getUrl(latestMeasurement.photo3);
    }
    if (latestMeasurement.photo4) {
      latestMeasurement.photo4 = await getUrl(latestMeasurement.photo4);
    }
    res.json(
      createResponse(latestMeasurement, "Measurement successfully retrive.")
    );
  } catch (error) {
    logger.error(
      "Error fetching latest measurement for user ID:",
      userId,
      error.message
    );
    // res.status(500).json({ error: error.message });
    next(error);
  }
};
// Define the get latest measurement for a user route
module.exports.getTrackingBYID = async (req, res, next) => {
  const { id } = req.params;

  try {
    const measurement = await db.Measurement.findByPk(req.params.id);

    if (measurement.photo1) {
      measurement.photo1 = await getUrl(measurement.photo1);
    }
    if (measurement.photo2) {
      measurement.photo2 = await getUrl(measurement.photo2);
    }
    if (measurement.photo3) {
      measurement.photo3 = await getUrl(measurement.photo3);
    }
    if (measurement.photo4) {
      measurement.photo4 = await getUrl(measurement.photo4);
    }
    res.json(createResponse(measurement, "Measurement successfully retrive."));
  } catch (error) {
    logger.error(
      "Error fetching latest measurement for user ID:",
      id,
      error.message
    );
    // res.status(500).json({ error: error.message });
    next(error);
  }
};

// Define the add new food entry route
module.exports.createFoodEntry = async (req, res, next) => {
  const { steps_to_do, avg_steps, result_dt, description, task_id } = req.body;

  try {
    const newEntry = await db.ResultTracking.create({
      task_id,
      eating_day_free_txt: description,
      steps_to_do,
      result_dt,
      avg_steps,
    });

    // Update the task status to 'Finish'
    if (task_id) {
      await db.Task.update({ task_status: "Finish" }, { where: { task_id } });
    }

    res.json(createResponse(newEntry, "New food entry successfully create."));
  } catch (error) {
    logger.error("Error inserting new food entry:", error.message);
    // res.status(500).json({ error: "Database error" });
    next(error);
  }
};

module.exports.generateMeasurementReport = async (req, res, next) => {
  const XLSX = require("xlsx");
  const fs = require("fs");
  const path = require("path");

  try {
    // Ensure the public directory exists
    const publicDir = path.join("public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }
    const fileName = Date.now() + ".xlsx";
    const filePath = path.join(publicDir, fileName);

    const { userId } = req.params;
    if (req.user.role === "user") userId = req.user.id;
    const measurements = await db.Measurement.findAll({
      where: { user_id: userId },
    });
    const data = [];
    measurements.map((item) => {
      data.push({
        arml: item.arml,
        armr: item.armr,
        thighl: item.thighl,
        thighr: item.thighr,
        chest: item.chest,
        waist: item.waist,
        weight: item.weight,
        body_fat_percentage: item.body_fat_percentage,
        date: item.date,
      });
    });

    // Create a new workbook and a worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, filePath);

    setTimeout(() => {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        } else {
          console.log('File deleted successfully:', filePath);
        }
      });
    }, 120000);

    res.json(createResponse(filePath, "Report file generated successfully."));
  } catch (error) {
    next(error);
  }
};
