const users = require("./users");
const tasks = require("./tasks");
const admin = require("./admin");
const workouts = require("./workouts");
const exercises = require("./exercises");
const nutrition_plans = require("./nutrition_plans");
const nutrition_guides = require("./nutrition_guides");
const tracking = require("./tracking");

module.exports = [
  users,
  tasks,
  admin,
  workouts,
  exercises,
  nutrition_plans,
  nutrition_guides,
  tracking,
];
