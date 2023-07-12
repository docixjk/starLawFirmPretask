"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const controller_1 = require("./controller");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.post("/login", controller_1.login);
app.get("/accessToken", controller_1.accessToken);
app.get("/refreshToken", controller_1.refreshToken);
app.get("/login/success", controller_1.loginSuccess);
app.post("/logout", controller_1.logout);
app.listen(process.env.PORT, () => {
    console.log(`server is on ${process.env.PORT}`);
});
