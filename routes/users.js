const router = require("express").Router();
const {
  register,
  loginUser,
  update,
  findAll,
  findOne,
  getIntroUrl,
  generateAssetUrl,
  updateUserDetials,
  registerWithGoogle,
} = require("../controllers/authController");
const { putObject } = require("../middlewares/s3Upload");
const { upload } = require("../middlewares/imageUpload");


router.post("/signup", register);
router.post("/signup-google", registerWithGoogle);
router.post("/login", loginUser);
router.post("/api/users/get-intro-url", getIntroUrl);
router.post("/api/users/generate-asset-url", generateAssetUrl);
router.put("/api/users/update-status/:id",  update);
router.put("/api/users/update-details/:id", upload.single("file"), putObject, updateUserDetials);
router.get("/api/users", findAll);
router.get("/api/users/:id", findOne);

module.exports = router;
