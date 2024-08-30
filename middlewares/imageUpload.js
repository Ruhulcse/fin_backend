const multer = require("multer");
const fs = require("fs");

// const storage = multer.diskStorage({
// destination: function (req, file, cb) {
// const imagePath = req.originalUrl.split("/")[2];
// const path = `${__dirname}/../../public/uploads/${imagePath}`;
// if (!fs.existsSync(path)) {
//   fs.mkdirSync(path, { recursive: true });
// }
// cb(null, path);
// },
// filename: function (req, file, cb) {
//   cb(null, Date.now() + "." + file.mimetype.split("/")[1]);
// },
// });

const imageFilter = function (req, file, cb) {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|mp4|pdf|PDF|mov|wmv|flv|avi|webm|mkv)$/)) {
    req.fileValidationError = "Only image files are allowed!";
    return cb(new Error("Only image files are allowed!"), false);
  }
  file.filename = Date.now() + "." + file.mimetype.split("/")[1];

  cb(null, true);
};

// module.exports.upload = multer({
//   storage: storage,
//   fileFilter: imageFilter,
//   // limits: {
//   //   fieldNameSize: 100,
//   //   fileSize: 5242880, // 5 Mb
//   // },
// }).single("file");
// const storage = multer.memoryStorage();
module.exports.upload = multer({ fileFilter: imageFilter });
