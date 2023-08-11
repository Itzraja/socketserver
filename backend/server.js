const express = require("express");
const http = require("http");
const app = express();
const { Server } = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const fileUpload = require("express-fileupload");

app.use(fileUpload());
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("requestVideoList", (video) => {
    const videoPath = path.join(__dirname, "public", "uploads", video); // Path to your video file
    const videoBuffer = fs.readFileSync(videoPath);
    socket.broadcast.emit("stream", videoBuffer);
  });
});

app.get("/videos", (req, res) => {
  const filePath = path.join(__dirname, "public", "uploads");

  fs.readdir(filePath, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return res.status(500).json({ message: "Server error" });
    }

    res.status(200).json({ files });
  });
});

app.post("/upload-video", (req, res) => {
  try {
    if (!req.files || !req.files.video) {
      return res.status(400).json({ message: "No video uploaded" });
    }

    const file = req.files.video;

    const uploadPath = path.join(__dirname, "public", "uploads", file.name);

    file.mv(uploadPath, (err) => {
      if (err) {
        console.error("Error saving file:", err);
        return res.status(500).json({ message: "Error saving file" });
      }

      console.log("File uploaded and saved");
      res.status(200).json({ message: "File uploaded successfully" });
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

server.listen(3001, () => {
  console.log("Server is running");
});
