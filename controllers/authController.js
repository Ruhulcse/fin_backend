const db = require("../models");
const User = db.User;
// const UserDetail = db.UserDetail;
const Task = db.Task;
const ApprovedEmail = db.ApprovedEmail;
const logger = require("../logger");
const hash = require("../helpers/password_hash");
const { createResponse } = require("../utils/responseGenerate");
const jwt = require("../helpers/jwt");
const { ErrorHandler } = require("../utils/error");
const { getUrl } = require("../middlewares/s3Upload");

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
  const { body, file, params } = req;
  const signature = file ? file.filename : null;
  try {
    const updateUser = await User.update(
      {
        first_name: body.first_name,
        last_name: body.last_name,
        name: body.name,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        zip_code: body.zip_code,
        DOB: body.DOB,
        symptom_free: body.symptom_free,
        covid_19: body.covid_19,
        signature,
        updatedAt: new Date(),
      },
      {
        where: {
          user_id: params.id,
        },
      }
    );

    res.json(createResponse(updateUser, "User successfully updated."));
  } catch (err) {
    next(err);
  }
};

module.exports.findOne = async (req, res, next) => {
  try {
    const users = await User.findByPk(req.params.id);
    if (users.signature) {
      users.dataValues.signature = await getUrl(users.dataValues.signature);
    }
    res.json(createResponse(users, "User successfully retrive."));
  } catch (error) {
    logger.error("Error fetching users for admin:", error);
    next(error);
  }
};

module.exports.findAll = async (req, res, next) => {
  try {
    const users = await User.findAll({});
    res.json(createResponse(users, "User successfully retrive."));
  } catch (error) {
    logger.error("Error fetching users for admin:", error.message);
    next(error);
  }
};

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
        gender: user.gender,
        status: user.status,
        exp: Math.floor(Date.now() / 100) + 60 * 60,
      };
      token = await jwt.encode(payload);
    }

    res.json(
      createResponse(
        {
          token,
          id: user.user_id,
          name: user.name,
          gender: user.gender,
          role: user.role,
        },
        "User successfully login."
      )
    );
  } catch (err) {
    next(err);
  }
};

module.exports.generateAssetUrl = async (req, res, next) => {
  try {
    const url = await getUrl(req.body.path);
    res.json(createResponse(url, "URL successfully retrive."));
  } catch (error) {
    logger.error("Error fetching url:", error.message);
    next(error);
  }
};

module.exports.getIntroUrl = async (req, res, next) => {
  try {
    let url = "";
    if (req.body.gender === "male") {
      url = await getUrl("intro/male_intro.mp4");
    }
    if (req.body.gender === "female") {
      url = await getUrl("intro/female_intro.mp4");
    }
    res.json(createResponse(url, "Intro successfully retrive."));
  } catch (error) {
    logger.error("Error fetching intro url:", error.message);
    next(error);
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
