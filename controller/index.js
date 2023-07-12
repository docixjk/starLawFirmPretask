"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.loginSuccess = exports.refreshToken = exports.accessToken = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const publicKey = process.env.RSA_PUBLICKEY || "";
const privateKey = process.env.RSA_PRIVATEKEY || "";
const userDatabase = [
    {
        id: 1,
        username: "star1",
        email: "staruser1@star.com",
        password: "star1",
        refreshToken: "",
    },
    {
        id: 2,
        username: "star2",
        email: "staruser2@star.com",
        password: "star2",
        refreshToken: "",
    },
];
// module
const login = (req, res) => {
    const { email, password } = req.body;
    const userInfo = userDatabase.find((item) => {
        return item.email === email && item.password === password;
    });
    if (!userInfo) {
        res.status(403).json("Not Authorized");
    }
    else {
        try {
            // access Token 발급
            const accessToken = jsonwebtoken_1.default.sign({
                id: userInfo.id,
                username: userInfo.username,
                email: userInfo.email,
            }, privateKey, {
                expiresIn: "5m",
                issuer: "star",
                algorithm: "RS256",
            });
            // refresh Token 밝급
            const refreshToken = jsonwebtoken_1.default.sign({
                id: userInfo.id,
                username: userInfo.username,
                email: userInfo.email,
            }, privateKey, {
                expiresIn: "24h",
                issuer: "star",
                algorithm: "RS256",
            });
            // 생성된 refresh token 가상 DB 저장
            const userData = userDatabase.find((item) => {
                return item.email === userInfo.email;
            });
            if (userData) {
                userData.refreshToken = refreshToken;
            }
            // token 전송 (cookie)
            res.cookie("accessToken", accessToken, {
                secure: false,
                httpOnly: true,
            });
            res.cookie("refreshToken", refreshToken, {
                secure: false,
                httpOnly: true,
            });
            res.status(200).json("login success");
        }
        catch (error) {
            res.status(500).json(error);
        }
    }
};
exports.login = login;
// access token (사용자 정보에 접근)
const accessToken = (req, res) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            res.status(403).json("Access token not found");
            return;
        }
        const data = jsonwebtoken_1.default.verify(token, publicKey, {
            algorithms: ["RS256"],
        });
        const userData = userDatabase.find((item) => {
            return item.email === data.email;
        });
        if (userData) {
            const { password } = userData, others = __rest(userData, ["password"]);
            res.status(200).json(others);
        }
        else {
            res.status(403).json("User not found");
        }
    }
    catch (error) {
        res.status(500).json(error);
    }
};
exports.accessToken = accessToken;
// access token을 갱신하는 용도
const refreshToken = (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            res.status(403).json("Refresh token not found");
            return;
        }
        const data = jsonwebtoken_1.default.verify(token, publicKey, {
            algorithms: ["RS256"],
        });
        const userData = userDatabase.find((item) => {
            return item.email === data.email;
        });
        if (userData) {
            // access Token 새로 발급
            const accessToken = jsonwebtoken_1.default.sign({
                id: userData.id,
                username: userData.username,
                email: userData.email,
            }, privateKey, {
                expiresIn: "5m",
                issuer: "star",
                algorithm: "RS256",
            });
            // accessToken 쿠키
            res.cookie("accessToken", accessToken, {
                secure: false,
                httpOnly: true,
            });
            res.status(200).json("Access Token Recreated");
        }
        else {
            res.status(403).json("User not found");
        }
    }
    catch (error) {
        res.status(500).json(error);
    }
};
exports.refreshToken = refreshToken;
// 로그인 성공시 사용자 정보를 전달
const loginSuccess = (req, res) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            res.status(403).json("Access token not found");
            return;
        }
        const data = jsonwebtoken_1.default.verify(token, publicKey, {
            algorithms: ["RS256"],
        });
        const userData = userDatabase.find((item) => {
            return item.email === data.email;
        });
        if (userData) {
            res.status(200).json({
                user: userData,
                status: "login success page",
            });
        }
        else {
            res.status(403).json("User not found");
        }
    }
    catch (error) {
        res.status(500).json(error);
    }
};
exports.loginSuccess = loginSuccess;
// 로그아웃 쿠키 삭제
const logout = (req, res) => {
    try {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.status(200).json("Logout Success");
    }
    catch (error) {
        res.status(500).json(error);
    }
};
exports.logout = logout;
