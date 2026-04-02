const express = require("express");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const Room = require("./models/Room");
require("dotenv").config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// MongoDB 接続
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected (factory)"))
  .catch(err => console.log(err));

// ✅ トークン検証を削除して、誰でもフォームを開けるように
app.get("/create", (req, res) => {
  res.send(`
    <form action="/create" method="POST">
      <input name="roomName" placeholder="ルーム名" required />
      <input name="password" placeholder="パスワード（任意）" />
      <input name="createdBy" placeholder="作成者名（任意）" />
      <button type="submit">ルームを作成</button>
    </form>
  `);
});

app.post("/create", async (req, res) => {
  const { roomName, password, createdBy } = req.body;
  const roomId = uuidv4();

  await Room.create({
    roomId,
    roomName,
    password: password || "",
    createdBy: createdBy || "匿名"
  });

  res.redirect(`/room/${roomId}`);
});

app.get("/room/:roomId", async (req, res) => {
  const room = await Room.findOne({ roomId: req.params.roomId });

  if (!room) return res.send("このルームは存在しません");

  res.send(`
    <h1>${room.roomName}</h1>
    <p>ルームID: ${room.roomId}</p>
    <p>作成者: ${room.createdBy}</p>
    <p>https://new-chat-site-chat-room.onrender.com</p>
  `);
});

app.get("/", (req, res) => {
  res.redirect("/create"); // ✅ トップページから直接フォームへ
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Factory running"));
