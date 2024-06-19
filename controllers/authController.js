const db = require("../models");
const User = db.User;
const UserDetail = db.UserDetail;
const Task = db.Task;
const ApprovedEmail = db.ApprovedEmail;
const logger = require("../logger");
const hash = require("../helpers/password_hash");
const { createResponse } = require("../utils/responseGenerate");
const jwt = require("../helpers/jwt");
const { ErrorHandler } = require("../utils/error");

const validateRegistrationData = (data) => {
  const requiredFields = [
    "name",
    "email",
    "password",
    // "phone",
    // "age",
    // "height",
    // "weight",
    // "trainingYears",
    // "trainingFrequency",
  ];
  for (const field of requiredFields) {
    if (!data[field]) {
      return `${field} is required`;
    }
  }
  return null;
};

// module.exports.register = async (req, res) => {
//   console.log("Register route");
//   logger.debug("Register route");

//   const {
//     name,
//     email,
//     password,
//     phone,
//     age,
//     height,
//     weight,
//     trainingYears,
//     trainingFrequency,
//     preferredTrainingLocation,
//     homeEquipment,
//     desiredEquipment,
//     strengthTrainingDescription,
//     preferredFocusAreas,
//     favoriteCardio,
//     currentCardioRoutine,
//     injuries,
//     highestWeight,
//     favoriteFoods,
//     dislikedFoods,
//     foodTrackingMethod,
//     pastDiets,
//     dailyNutrition,
//     weekendNutrition,
//     favoriteRecipes,
//     alcoholConsumption,
//     medications,
//     sleepHours,
//     currentJob,
//     activityLevel,
//     sportsParticipation,
//     mirrorReflection,
//     longTermGoals,
//     motivationLevel,
//     commitmentDeclaration,
//     additionalNotes,
//     medicalStatement,
//     signature,
//     termsAccepted,
//     mailingAccepted,
//     status,
//     due_date,
//   } = req.body;

//   console.log("Request body:", req.body);

//   const validationError = validateRegistrationData(req.body);
//   if (validationError) {
//     logger.error("Validation error:", validationError);
//     return res.status(400).json({ error: validationError });
//   }

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     logger.debug("Password hashed successfully.");

//     const newUser = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role: "user",
//       status: status || null, // Set status if provided, otherwise null
//       due_date: due_date || null, // Set due_date if provided, otherwise null
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     });
//     const userId = newUser.user_id;
//     logger.info("User inserted successfully with ID:", userId);

//     await UserDetail.create({
//       user_id: userId,
//       phone,
//       age,
//       height,
//       weight,
//       training_years: trainingYears,
//       training_frequency: trainingFrequency,
//       preferred_training_location: preferredTrainingLocation,
//       home_equipment: homeEquipment,
//       desired_equipment: desiredEquipment,
//       strength_training_description: strengthTrainingDescription,
//       preferred_focus_areas: preferredFocusAreas,
//       favorite_cardio: favoriteCardio,
//       current_cardio_routine: currentCardioRoutine,
//       injuries,
//       highest_weight: highestWeight,
//       favorite_foods: favoriteFoods,
//       disliked_foods: dislikedFoods,
//       food_tracking_method: foodTrackingMethod,
//       past_diets: pastDiets,
//       daily_nutrition: dailyNutrition,
//       weekend_nutrition: weekendNutrition,
//       favorite_recipes: favoriteRecipes,
//       alcohol_consumption: alcoholConsumption,
//       medications,
//       sleep_hours: sleepHours,
//       current_job: currentJob,
//       activity_level: activityLevel,
//       sports_participation: sportsParticipation,
//       mirror_reflection: mirrorReflection,
//       long_term_goals: longTermGoals,
//       motivation_level: motivationLevel,
//       commitment_declaration: commitmentDeclaration,
//       additional_notes: additionalNotes,
//       medical_statement: JSON.stringify(medicalStatement),
//       signature,
//       terms_accepted: termsAccepted,
//       mailing_accepted: mailingAccepted,
//     });

//     logger.info("User details inserted successfully");

//     const tasks = [
//       {
//         user_id: userId,
//         task_name: "יומן תזונה יום ראשון",
//         task_description:
//           "This is your first welcome task. Get familiar with our platform.",
//         task_status: "Pending",
//         task_type: "food",
//         due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
//       },
//       {
//         user_id: userId,
//         task_name: "יומן תזונה יום שני",
//         task_description:
//           "This is your second welcome task. Complete your profile.",
//         task_status: "Pending",
//         task_type: "food",
//         due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
//       },
//       {
//         user_id: userId,
//         task_name: "יומן תזונה יום שלישי",
//         task_description:
//           "This is your third welcome task. Set your fitness goals.",
//         task_status: "Pending",
//         task_type: "food",
//         due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
//       },
//       {
//         user_id: userId,
//         task_name: "מדידת היקפים",
//         task_description:
//           "This is your fourth welcome task. Start tracking your progress.",
//         task_status: "Pending",
//         task_type: "measure",
//         due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//       },
//     ];

//     for (const task of tasks) {
//       await Task.create(task);
//     }

//     logger.info("Tasks inserted successfully for user ID:", userId);
//     res.status(201).json(newUser);
//   } catch (error) {
//     logger.error("Error during user registration:", error.message);
//     console.log("Error details:", error); // Log the full error for debugging
//     res.status(400).json({ error: error.message });
//   }
// };

module.exports.register = async (req, res, next) => {
  const { body, user } = req;

  const validationError = validateRegistrationData(body);
  if (validationError) {
    res.json(createResponse(null, validationError));
  }
  if (body.password) {
    const hashPass = await hash.new(body.password);
    body.password = hashPass;
  }
  try {
    const checkApprovedMail = await ApprovedEmail.findOne({
      where: { email: body.email },
    });
    if (!checkApprovedMail) {
      console.log("Please Contact With Admin. Your Email Not Entry To System!");
      throw new ErrorHandler(
        "Please Contact With Admin. Your Email Not Entry To System!",
        400
      );
    }
    const isExist = await User.findOne({ where: { email: body.email } });
    if (isExist) {
      console.log("User is already existed.");
      throw new ErrorHandler("User is already existed.", 409);
    }
    const newUser = await User.create({
      first_name: body.first_name,
      last_name: body.last_name,
      name: body.name,
      email: body.email,
      gender: body.gender,
      password: body.password,
      role: "user",
      status: body.status || null, // Set status if provided, otherwise null
      due_date: body.due_date || null, // Set due_date if provided, otherwise null
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const userId = newUser.user_id;
    const tasks = [
      {
        user_id: userId,
        task_name: "יומן תזונה יום ראשון",
        task_description:
          "This is your first welcome task. Get familiar with our platform.",
        task_status: "Pending",
        task_type: "food",
        due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      },
      {
        user_id: userId,
        task_name: "יומן תזונה יום שני",
        task_description:
          "This is your second welcome task. Complete your profile.",
        task_status: "Pending",
        task_type: "food",
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
      {
        user_id: userId,
        task_name: "יומן תזונה יום שלישי",
        task_description:
          "This is your third welcome task. Set your fitness goals.",
        task_status: "Pending",
        task_type: "food",
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      {
        user_id: userId,
        task_name: "מדידת היקפים",
        task_description:
          "This is your fourth welcome task. Start tracking your progress.",
        task_status: "Pending",
        task_type: "measure",
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const task of tasks) {
      await Task.create(task);
    }

    let token = "";
    if (newUser) {
      const payload = {
        id: userId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        exp: Math.floor(Date.now() / 100) + 60 * 60,
      };
      token = await jwt.encode(payload);
    }
    res.json(
      createResponse(
        { token, name: newUser.name, name: newUser.name, id: userId },
        "User successfully create."
      )
    );
  } catch (err) {
    next(err);
  }
};

module.exports.update = async (req, res, next) => {
  const { body, user } = req;
  try {
    const updateUser = await User.create({
      name: body.name,
      updatedAt: new Date(),
    });

    const tasks = [
      {
        user_id: userId,
        task_name: "יומן תזונה יום ראשון",
        task_description:
          "This is your first welcome task. Get familiar with our platform.",
        task_status: "Pending",
        task_type: "food",
        due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      },
      {
        user_id: userId,
        task_name: "יומן תזונה יום שני",
        task_description:
          "This is your second welcome task. Complete your profile.",
        task_status: "Pending",
        task_type: "food",
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
      {
        user_id: userId,
        task_name: "יומן תזונה יום שלישי",
        task_description:
          "This is your third welcome task. Set your fitness goals.",
        task_status: "Pending",
        task_type: "food",
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      {
        user_id: userId,
        task_name: "מדידת היקפים",
        task_description:
          "This is your fourth welcome task. Start tracking your progress.",
        task_status: "Pending",
        task_type: "measure",
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const task of tasks) {
      await Task.create(task);
    }

    let token = "";
    if (newUser) {
      const payload = {
        id: newUser.user_id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        exp: Math.floor(Date.now() / 100) + 60 * 60,
      };
      token = await jwt.encode(payload);
    }
    res.json(
      createResponse(
        { token, name: newUser.name, name: newUser.name, id: newUser.user_id },
        "User successfully create."
      )
    );
  } catch (err) {
    next(err);
  }
};

// module.exports.login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ where: { email } });
//     if (user && (await bcrypt.compare(password, user.password))) {
//       res.json({
//         id: user.user_id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       });
//     } else {
//       res.status(400).json({ error: "Invalid credentials" });
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

module.exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.json(createResponse(null, "User unauthorized!."));
      // throw new ErrorHandler("User unauthorized!.", 401);
      return;
    }
    const verifyPass = await hash.verify(password, user.password);
    if (!verifyPass) {
      res.json(createResponse(null, "User info invalid!."));
      return;
      // throw new ErrorHandler("User info invalid!.", 400);
    }
    let token = "";
    if (user) {
      const payload = {
        id: user.user_id,
        name: user.name,
        role: user.role,
        status: user.status,
        exp: Math.floor(Date.now() / 100) + 60 * 60,
      };
      token = await jwt.encode(payload);
    }

    res.json(
      createResponse(
        { token, id: user._id, name: user.name, role: user.role },
        "User successfully login."
      )
    );
  } catch (err) {
    next(err);
  }
};

// await UserDetail.create({
//   user_id: userId,
//   phone,
//   age,
//   height,
//   weight,
//   training_years: trainingYears,
//   training_frequency: trainingFrequency,
//   preferred_training_location: preferredTrainingLocation,
//   home_equipment: homeEquipment,
//   desired_equipment: desiredEquipment,
//   strength_training_description: strengthTrainingDescription,
//   preferred_focus_areas: preferredFocusAreas,
//   favorite_cardio: favoriteCardio,
//   current_cardio_routine: currentCardioRoutine,
//   injuries,
//   highest_weight: highestWeight,
//   favorite_foods: favoriteFoods,
//   disliked_foods: dislikedFoods,
//   food_tracking_method: foodTrackingMethod,
//   past_diets: pastDiets,
//   daily_nutrition: dailyNutrition,
//   weekend_nutrition: weekendNutrition,
//   favorite_recipes: favoriteRecipes,
//   alcohol_consumption: alcoholConsumption,
//   medications,
//   sleep_hours: sleepHours,
//   current_job: currentJob,
//   activity_level: activityLevel,
//   sports_participation: sportsParticipation,
//   mirror_reflection: mirrorReflection,
//   long_term_goals: longTermGoals,
//   motivation_level: motivationLevel,
//   commitment_declaration: commitmentDeclaration,
//   additional_notes: additionalNotes,
//   medical_statement: JSON.stringify(medicalStatement),
//   signature,
//   terms_accepted: termsAccepted,
//   mailing_accepted: mailingAccepted,
// });

// logger.info("User details inserted successfully");
