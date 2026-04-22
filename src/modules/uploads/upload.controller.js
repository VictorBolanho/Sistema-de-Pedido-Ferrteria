const path = require("path");

async function uploadImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se recibió ningún archivo." });
    }

    const fileName = req.file.filename;
    const fileUrl = path.posix.join("/uploads", fileName);
    res.status(201).json({ url: fileUrl });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadImage,
};
