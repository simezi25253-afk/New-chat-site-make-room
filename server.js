const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const Room = require("./models/Room");
require("dotenv").config();

const app = express();
app.use(express.urlencoded({ extended: true }));

// MongoDB 接続
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected (factory)"))
  .catch(err => console.log(err));


app.get("/create", (req, res) => {
　const token = req.body.token;
  if (!token) return res.send("トークンがありません。ログインしてください。");

  res.send(`
    <form action="/create" method="POST">
      <input type="hidden" name="token" value="${token}" />
      <input name="roomName" placeholder="ルーム名" required />
      <input name="password" placeholder="パスワード（任意）" />
      <button type="submit">ルームを作成</button>
    </form>
  `);
});



app.post("/create", async (req, res) => {
  const token = req.body.token;  // ← 修正ポイント

  if (!token) return res.send("トークンがありません。ログインしてください。");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.send("トークンが無効です。ログインし直してください。");
  }

  const username = decoded.username;
  const { roomName, password } = req.body;

  const roomId = uuidv4();

  await Room.create({
    roomId,
    roomName,
    password: password || "",
    createdBy: username
  });

  res.redirect(`/room/${roomId}?token=${token}`);
});


// チャットルーム本体（テンプレート）
app.get("/room/:roomId", async (req, res) => {
  const token = req.query.token;

  if (!token) return res.send("トークンがありません。ログインしてください。");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.send("トークンが無効です。ログインし直してください。");
  }

  const username = decoded.username;

  const room = await Room.findOne({ roomId: req.params.roomId });

  if (!room) return res.send("このルームは存在しません");

  res.send(`
    <h1>${room.roomName}</h1>
    <p>ルームID: ${room.roomId}</p>
    <p>ユーザー名: ${username}</p>
    <p>https://new-chat-site-chat-room.onrender.com</p>
  `);
});

// トップページ（工場の入り口）
app.get("/", (req, res) => {
  res.send(`
    <h1>チャットルーム工場へようこそ 🚀</h1>
    <p>ログインサイトからトークンを取得して、ルームを作成してください。</p>
    <a href="/create?token=YOUR_TOKEN_HERE">ルーム作成ページへ</a>
  `);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Factory running"));
