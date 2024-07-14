const db = require("../models");
const User = db.User;
const UserDetail = db.UserDetail;
const Task = db.Task;
const ApprovedEmail = db.ApprovedEmail;
const { Op, col, fn, where } = require("sequelize");
const logger = require("../logger");
const hash = require("../helpers/password_hash");
const { createResponse } = require("../utils/responseGenerate");
const jwt = require("../helpers/jwt");
const { ErrorHandler } = require("../utils/error");
const { getUrl } = require("../middlewares/s3Upload");
const { sendMail } = require("../helpers/mail");
// const { sendEmail } = require("../helpers/mailchimp");

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

module.exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email, status: "active" } });
    if (!user) {
      res.json(createResponse(null, "User unauthorized!."));
      // throw new ErrorHandler("User unauthorized!.", 401);
      return;
    }
    const userPass =
      req.body.login_type === "google" ? user.google_password : user.password;
    const verifyPass = await hash.verify(password, userPass);
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
        email: user.email,
        role: user.role,
        gender: user.gender,
        status: user.status,
        new_user: user.new_user,
        exp: Math.floor(Date.now() / 100) + 60 * 60,
      };
      token = await jwt.encode(payload);
    }
    // await sendEmail();
    res.json(
      createResponse(
        {
          token,
          id: user.user_id,
          name: user.name,
          gender: user.gender,
          role: user.role,
          new_user: user.new_user,
        },
        "User successfully login."
      )
    );
  } catch (err) {
    next(err);
  }
};

module.exports.register = async (req, res, next) => {
  const { body, user } = req;

  const validationError = validateRegistrationData(body);
  if (validationError) {
    res.json(createResponse(null, validationError));
  }
  if (body.password) {
    const hashPass = await hash.new(body.password);
    if (body?.login_type === "google") {
      body.google_password = hashPass;
      body.password = "";
    } else {
      body.google_password = "";
      body.password = hashPass;
    }
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
    let newUser;
    if (isExist) {
      console.log("User is already existed.");
      throw new ErrorHandler("User is already existed.", 409);
    } else {
      const role = [
        "mr.tomergat@gmail.com",
        "2020belayethossain@gmail.com",
        "tareqatoffice@gmail.com",
      ].includes(body.email)
        ? "admin"
        : "user";
      newUser = await User.create({
        first_name: body.first_name,
        last_name: body.last_name,
        name: body.name,
        email: body.email,
        gender: body.gender,
        password: body.password,
        google_password: body.google_password,
        role,
        status: body.status ?? "active", // Set status if provided, otherwise null
        // due_date: body.due_date || null, // Set due_date if provided, otherwise null
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
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

    //send mail
    const mailOptions = {
      to: newUser.email,
      subject: `Welcome to BasisTraining`,
      html: `<h2>Thank you for registering with BasisTraining.</h2>`,
    };
    await sendMail(mailOptions);

    res.json(
      createResponse(
        {
          token,
          name: newUser.name,
          name: newUser.name,
          id: userId,
          new_user: newUser.new_user,
          gender: newUser.gender,
          role: newUser.role,
        },
        "User successfully create."
      )
    );
  } catch (err) {
    next(err);
  }
};

module.exports.registerWithGoogle = async (req, res, next) => {
  const { body, user } = req;
  try {
    const isExist = await User.findOne({ where: { email: body.email } });
    if (isExist) {
      req.body.login_type = "google";
      return await this.loginUser(req, res, next);
    } else {
      req.body.login_type = "google";
      return await this.register(req, res, next);
    }
  } catch (err) {
    next(err);
  }
};

module.exports.update = async (req, res, next) => {
  const { body, params } = req;
  const payload = { updatedAt: new Date() };
  if (body.gender) payload.gender = body.gender;
  if (body.role) payload.role = body.role;
  if (body.status) payload.status = body.status;
  if (body.new_user) payload.new_user = body.new_user;
  try {
    const updateUser = await User.update(payload, {
      where: {
        user_id: params.id,
      },
    });

    res.json(createResponse(updateUser, "User successfully updated."));
  } catch (err) {
    next(err);
  }
};

module.exports.findOne = async (req, res, next) => {
  try {
    const users = await User.findByPk(req.params.id, {
      attributes: [
        "user_id",
        "name",
        "first_name",
        "last_name",
        "gender",
        "email",
      ],
      include: [
        {
          model: db.UserDetail,
        },
      ],
    });
    res.json(createResponse(users, "User successfully retrive."));
  } catch (error) {
    logger.error("Error fetching users for admin:", error);
    next(error);
  }
};

module.exports.findAll = async (req, res, next) => {
  let { query } = req;
  if (query.search) {
    const { search, ...restQuery } = query;
    query = {
      ...restQuery,
      [Op.or]: [
        where(fn("LOWER", col("name")), {
          [Op.like]: `%${search.toLowerCase()}%`,
        }),
        where(fn("LOWER", col("email")), {
          [Op.like]: `%${search.toLowerCase()}%`,
        }),
        where(fn("LOWER", col("gender")), {
          [Op.like]: `%${search.toLowerCase()}%`,
        }),
      ],
    };
  }
  try {
    const users = await User.findAll({
      where: query,
      attributes: [
        "user_id",
        "name",
        "first_name",
        "last_name",
        "gender",
        "email",
        "role",
        "status",
      ],
    });
    res.json(createResponse(users, "User successfully retrive."));
  } catch (error) {
    logger.error("Error fetching users for admin:", error.message);
    next(error);
  }
};

module.exports.getUserAgreements = async (req, res, next) => {
  const { query } = req;
  if (req.user.role === "user") query.user_id = req.user.id;
  try {
    const users = await User.findAll({
      where: query,
      attributes: [
        "user_id",
        "name",
        "first_name",
        "last_name",
        "gender",
        "email",
      ],
      include: [
        {
          model: db.UserDetail,
        },
      ],
    });
    if (users && users.length === 1 && users[0]?.UserDetail.signature) {
      users[0].UserDetail.signature = await getUrl(
        users[0].UserDetail.signature
      );
    }
    res.json(createResponse(users, "User successfully retrive."));
  } catch (error) {
    logger.error("Error fetching users for admin:", error.message);
    next(error);
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

module.exports.updateUserDetials = async (req, res, next) => {
  const { body, file } = req;
  const signature = file ? file.filename : null;
  const data = JSON.parse(body.user_details);

  try {
    const isExist = await User.findOne({ where: { user_id: data.user_id } });
    if (!isExist) {
      const details = await UserDetail.create({
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
        health_declaration: body.health_declaration,
        signature,
        terms_accepted: data.termsAccepted,
        mailing_accepted: data.mailingAccepted,
      });
      res.json(createResponse(details, "User details inserted successfully"));
    }

    res.json(createResponse(null, "User details already exist."));
  } catch (err) {
    console.log("🚀 ~ module.exports.updateUserDetials= ~ err:", err);
    next(err);
  }
};
