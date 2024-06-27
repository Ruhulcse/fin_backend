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
        gender: body.gender,
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
    if (users && users?.signature) {
      users.signature = await getUrl(users.signature);
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
    const user = await User.findOne({ where: { email, status: true } });
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

updateUserDetials = async (data) => {
  await UserDetail.create({
    user_id: data.user_id,
    phone: data.phone,
    age: data.age,
    height: data.height,
    weight: data.weight,
    highest_weight: data.highest_weight,
    training_years: data.training_years,
    training_frequency: data.training_frequency,
    preferred_training_location: data.preferred_training_location,
    home_equipment: data.home_equipment,
    desired_equipment: data.desired_equipment,
    strength_training_description: data.strength_training_description,
    favorite_cardio: data.favorite_cardio,
    preferred_focus_areas: data.preferred_focus_areas,
    injuries: data.injuries,
    favorite_foods: data.favorite_foods,
    disliked_foods: data.disliked_foods,
    food_tracking_method: data.food_tracking_method,
    past_diets: data.past_diets,
    current_cardio_routine: data.current_cardio_routine,
    daily_nutrition: data.daily_nutrition,
    weekend_nutrition: data.weekend_nutrition,
    favorite_recipes: data.favorite_recipes,
    alcohol_consumption: data.alcohol_consumption,
    medications: data.medications,
    sleep_hours: data.sleep_hours,
    current_job: data.current_job,
    activity_level: data.activity_level,
    sports_participation: data.sports_participation,
    mirror_reflection: data.mirror_reflection,
    long_term_goals: data.long_term_goals,
    motivation_level: data.motivation_level,
    commitment_declaration: data.commitment_declaration,
    additional_notes: data.additional_notes,
    medical_statement: data.JSON.stringify(medicalStatement),
    signature,
    terms_accepted: data.termsAccepted,
    mailing_accepted: data.mailingAccepted,
  });

  logger.info("User details inserted successfully");
  return true;
};
