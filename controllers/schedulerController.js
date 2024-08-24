const schedule = require("node-schedule");
const db = require("../models");

// Define the job to run every Saturday night for create weekly task
schedule.scheduleJob("* * * * * 7", async function () {
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
      status: "pending",
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
