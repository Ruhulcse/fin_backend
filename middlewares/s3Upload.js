const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
require("dotenv").config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// const contentType = {
//   mp4: "video/mp4",
//   webm: "video/webm",
//   ogg: "video/ogg",
//   avi: "video/x-msvideo",
//   mov: "video/quicktime",
//   wmv: "video/x-ms-wmv",
//   mkv: "video/x-matroska",
//   flv: "video/x-flv",
//   pdf: "application/pdf",
//   doc: "application/msword",
//   docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
// };

const putObject = async (req, res, next) => {
  const { files, file } = req;
  const path = req.originalUrl.split("/")[2];

  try {
    if (file) {
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: path + "/" + file.filename,
        Body: file.buffer,
        ContentType: file.mimetype,
        ContentDisposition: "inline",
      });
      await s3Client.send(command);
      req.file.filename = path + "/" + file.filename;
    }
    if (files) {
      for (const file of files) {
        const command = new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: path + "/" + file.filename,
          Body: file.buffer,
          ContentType: file.mimetype,
          ContentDisposition: "inline",
        });
        await s3Client.send(command);
        file.filename = path + "/" + file.filename;
      }
    }
    next();
  } catch (err) {
    console.error("Error fronm put object::", err);
    next(err);
  }
};

const deleteObject = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    });
    await s3Client.send(command);
    console.log(key, " Deleted Successfully from s3.");
    return true;
  } catch (err) {
    console.error("Error fronm delete object:", err);
    return false;
  }
};

const getUrl = async (key) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    });
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  } catch (err) {
    console.error("Error fronm get object::", err);
    res.status(500).json({ error: "Error fronm get object:" + err });
  }
};

// const getObject = async (req, res, next) => {
//   const { key } = req.params;

//   try {
//     const command = new GetObjectCommand({
//       Bucket: process.env.AWS_S3_BUCKET,
//       Key: key,
//     });
//     const data = await s3Client.send(command);
//     const passThrough = new stream.PassThrough();
//     stream.pipeline(data.Body, passThrough, (err) => {
//       if (err) {
//         console.error("Stream pipeline error:", err);
//         return next(err);
//       }
//     });
//     passThrough.pipe(res);
//   } catch (err) {
//     console.error("Error getting object:", err);
//     // res.status(500).json({ error: "Error getting object" });
//     next(err)
//   }
// };

module.exports = { getUrl, putObject, deleteObject };
