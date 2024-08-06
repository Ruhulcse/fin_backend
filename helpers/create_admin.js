const db = require("../models");
const User = db.User;
const hash = require("./password_hash");

//create user
(async () => {
  try {
    const checkApprovedMail = await db.ApprovedEmail.findOne({
      where: { email: "mr.tomergat@gmail.com" },
    });
    if (!checkApprovedMail) {
      await db.ApprovedEmail.bulkCreate([
        { email: "mr.tomergat@gmail.com" },
        { email: "2020belayethossain@gmail.com" },
        { email: "tareqatoffice@gmail.com" },
        { email: "kawser07.khk@gmail.com" },
        { email: "ruhul.cse123@gmail.com" },
      ]);
    }

    const admin = await User.findOne({ where: { email: "test@example.com" } });
    if (!admin) {
      const hashPass = await hash.new("123456");
      const userInfo = {
        first_name: "Jone",
        last_name: "Doe",
        name: "Jone Doe",
        email: "test@example.com",
        password: hashPass,
        gender: "male",
        role: "admin",
        status: "active",
        is_admin: true,
        new_user: false,
      };

      await User.create(userInfo);
      console.log("admin user created");

      return;
    } else {
      console.log("admin already exists");
      return;
    }
  } catch (error) {
    console.error("admin user create failed", error);
  }
})();
