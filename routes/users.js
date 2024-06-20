const router = require("express").Router();
const {
  register,
  loginUser,
  update,
  findAll,
  findOne,
} = require("../controllers/authController");
const { putObject } = require("../middlewares/s3Upload");
const { upload } = require("../middlewares/imageUpload");


router.post("/signup", register);
router.post("/login", loginUser);
router.put("/api/users/update/:id", upload.single("file"), putObject, update);
router.get("/api/users", findAll);
router.get("/api/users/:id", findOne);

module.exports = router;
