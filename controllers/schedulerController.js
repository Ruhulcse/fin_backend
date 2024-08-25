const schedule = require("node-schedule");
const db = require("../models");
const { Op } = require("sequelize");

// Define the job to run every Saturday night for create weekly task
schedule.scheduleJob("0 0 22 * * 6", async function () {
  console.log(
    "Running scheduled job at 10:00 PM every Saturday night for create weekly task"
  );
  // update incomplete tasks
  await db.Task.update(
    { task_status: "Missed" },
    {
      where: {
        task_status: "Pending",
        task_type: "workout",
      },
    }
  );

  const trainings = await db.Training.findAll({
    where: {
      status: "active",
    },
    include: [
      {
        model: db.TrainingRecord,
        attributes: ["training_record_id"],
        include: [
          {
            model: db.Workout,
            attributes: ["workout_id", "workout_name", "workout_description"],
          },
        ],
      },
    ],
  });

  // create new task for current week
  for (const training of trainings) {
    await db.Task.create({
      user_id: training.user_id,
      task_name: training.TrainingRecord?.Workout.workout_name,
      task_status: "Pending",
      task_type: "workout",
      task_description: training.TrainingRecord?.Workout.workout_description,
      workout_id: training.TrainingRecord?.Workout.workout_id,
    });
  }
  console.log("End running scheduled job");
});

// Define the job to run every night for create measurement task
schedule.scheduleJob("* *  * * *", async function () {
  console.log(
    "Running scheduled job at 10:00 PM every night for create measurement task"
  );
  
  const today = new Date().toISOString().slice(0, 10);
  const measurements = await db.Measurement.findAll({
    where: {
      renew_date: {
        [Op.eq]: new Date(today), // Compare renew_date with the current date
      },
    },
  });

  // create new task for measurement
  for (const measurement of measurements) {
    await db.Task.create({
      user_id: measurement.user_id,
      task_name: "מדידת היקפים",
      task_description:
        "Tracking your progress.",
      task_status: "Pending",
      task_type: "measure",
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
  }
  console.log("End running scheduled job");
});
