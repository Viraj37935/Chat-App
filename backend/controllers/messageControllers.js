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


const handleFileSharingClick = async (e) => {
  const file = fileInput.files[0];

  // Create a FormData object to store the file.
  const formData = new FormData();
  formData.append("file", file);

  // Send a POST request to the file upload endpoint.
  const response = await fetch("/api/chat/file/upload", {
    method: "POST",
    body: formData,
  });

  // Check the response status code to see if the file was uploaded successfully.
  if (response.status === 200) {
    // The file was uploaded successfully.
    // Get the URL of the uploaded file from the response.
    const fileUrl = await response.json();
    fileUrl = fileUrl.fileUrl;

    // Display the URL of the uploaded file in the chat conversation.
    const chatMessage = document.querySelector("#chat-message");
    chatMessage.innerHTML += `<a href="${fileUrl}">${file.name}</a>`;
  } else {
    // There was an error uploading the file.
    // Display an error message to the user.
  }
};

module.exports = { allMessages, sendMessage, handleFileSharingClick };
