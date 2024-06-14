const db = require("../models");
const User = db.User;
const hash = require("./password_hash");

//create user
(async () => {
  try {
    const admin = await User.findOne({ where: { email: "test@example.com" } });
    if (!admin) {
      const hashPass = await hash.new("123456");
      const userInfo = {
        name: "Jone",
        email: "test@example.com",
        password: hashPass,
        gender: "male",
        role: "admin",
        is_admin: true,
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
