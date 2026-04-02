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


// ルーム作成フォーム
app.get("/create", (req, res) => {
  res.send(`
    <h1>ルーム作成</h1>
    <form action="/create" method="POST">
      <input name="roomName" placeholder="ルーム名" required />
      <input name="password" placeholder="パスワード（任意）" />
      <input name="createdBy" placeholder="作成者名（任意）" />
      <button type="submit">ルームを作成</button>
    </form>
  `);
});


// ルーム作成処理（白画面の原因を修正済み）
app.post("/create", async (req, res) => {
  const { roomName, password, createdBy } = req.body;
  const roomId = uuidv4();

  const newRoom = await Room.create({
    roomId,
    roomName,
    password: password || "",
    createdBy: createdBy || "匿名"
  });

  // ★ 修正ポイント：作成後に正しくルームページへリダイレクト
  res.redirect(`/room/${newRoom.roomId}`);
});


// ルームページ（白画面にならないように完全修正版）
app.get("/room/:roomId", async (req, res) => {
  const room = await Room.findOne({ roomId: req.params.roomId });

  if (!room) {
    return res.send("<h1>このルームは存在しません</h1>");
  }

  res.send(`
    <h1>${room.roomName}</h1>
    <p>ルームID: ${room.roomId}</p>
    <p>作成者: ${room.createdBy}</p>

    <p>チャットページへ:</p>
    <a href="https://new-chat-site-chat-room.onrender.com">
      <button>チャットに入る</button>
    </a>
  `);
});


// トップページ → ルーム作成へ
app.get("/", (req, res) => {
  res.redirect("/create");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Factory running"));
