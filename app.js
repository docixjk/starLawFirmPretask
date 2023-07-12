const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

// 따로 작성한 controller를 받아옴
const {
  login,
  accessToken,
  refreshToken,
  loginSuccess,
  logout,
} = require("./controller");

const app = express();

// dotenv port 가져오기
dotenv.config();

// 기본 설정
app.use(express.json()); // json 미들웨어 설정
app.use(cookieParser()); // jwt 를 위한 cookieParser 설정

// login 요청
app.post("/login", login);

// access token 발행 요청
app.get("/accessToken", accessToken);

// access token 갱신하는 refresh token 요청
app.get("/refreshToken", refreshToken);

// login 성공시 요청
app.get("/login/success", loginSuccess);

// logout 요청
app.post("/logout", logout);

// port 연결
app.listen(process.env.PORT, () => {
  console.log(`server is on ${process.env.PORT}`);
});
