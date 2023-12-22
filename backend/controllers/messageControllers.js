// import { renameSync } from "fs";

const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic").execPopulate();
    message = await message.populate("chat").execPopulate();
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected

const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const addImageMessage = async (req, res) => {
  try {
    if (req.file) {
      let fileName = "uploads/images/" + req.file.originalname;
      console.log(fileName, req.file.path);
      renameSync(req.file.path, fileName);
      const { sender, chat } = req.query;

      if (sender && chat) {
        const message = await Message.create({
          data: {
            message: fileName,
            sender: req.user._id,
            chat: chatId,
            type: "image",
          },
        });
        return res.status(201).json({ message });
      }
      return res.status(400).send("sender,chat is required.");
    }
    return res.status(400).send("Image is required.");
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

module.exports = { allMessages, sendMessage, addImageMessage };
