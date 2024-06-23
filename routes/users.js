const router = require("express").Router();
const {
  register,
  loginUser,
  update,
  findAll,
  findOne,
  getIntroUrl,
  generateAssetUrl,
} = require("../controllers/authController");
const { putObject } = require("../middlewares/s3Upload");
const { upload } = require("../middlewares/imageUpload");


router.post("/signup", register);
router.post("/login", loginUser);
router.post("/api/users/get-intro-url", getIntroUrl);
router.post("/api/users/generate-asset-url", generateAssetUrl);
router.put("/api/users/update/:id", upload.single("file"), putObject, update);
router.get("/api/users", findAll);
router.get("/api/users/:id", findOne);

module.exports = router;
