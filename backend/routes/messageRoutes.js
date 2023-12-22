const express = require("express");
const {
  allMessages,
  sendMessage,
  addImageMessage,
} = require("../controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");
const multer = require("multer");

const router = express.Router();

const uploadImage = multer({ dest: "uploads/images" });

router.route("/").post(protect, sendMessage);
router.route("/:chatId").get(protect, allMessages);
router.post("/add-image-message", uploadImage.single("image"), addImageMessage);

module.exports = router;
