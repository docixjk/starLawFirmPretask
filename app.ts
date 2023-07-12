/**
 * 로그인 API 서비스 제작 ( JWT, Access Token 구현 )
 * 2023.07.08. ~ 2023.07.13.
 */
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import {
  login,
  accessToken,
  refreshToken,
  loginSuccess,
  logout,
} from "./controller";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

// 사용자 확인 후 토큰 발급 및 쿠키
app.post("/login", login);

// 사용자 정보 접근
app.get("/accessToken", accessToken);

// refresh token 확인 후 access token 갱신
app.get("/refreshToken", refreshToken);

// 로그인 성공시
app.get("/login/success", loginSuccess);

// 로그아웃
app.post("/logout", logout);

// 포트 읽기
app.listen(process.env.PORT, () => {
  console.log(`server is on ${process.env.PORT}`);
});
