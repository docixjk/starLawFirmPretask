const jwt = require("jsonwebtoken");

const dotenv = require("dotenv");
dotenv.config();

const publicKey = process.env.RSA_PUBLICKEY;
const privateKey = process.env.RSA_PRIVATEKEY;

var userDatabase = [
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
  } else {
    try {
      // access Token 발급
      const accessToken = jwt.sign(
        {
          id: userInfo.id,
          username: userInfo.username,
          email: userInfo.email,
        },
        privateKey,
        {
          expiresIn: "5m",
          issuer: "star",
          algorithm: "RS256",
        }
      );

      // refresh Token 밝급
      const refreshToken = jwt.sign(
        {
          id: userInfo.id,
          username: userInfo.username,
          email: userInfo.email,
        },
        privateKey,
        {
          expiresIn: "24h",
          issuer: "star",
          algorithm: "RS256",
        }
      );

      // 생성된 refresh token 가상 DB 저장
      const userData = userDatabase.find((item) => {
        return item.email === userInfo.email;
      });
      userData.refreshToken = refreshToken;

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
    } catch (error) {
      res.status(500).json(error);
    }
  }
};

// access token (사용자 정보에 접근)
const accessToken = (req, res) => {
  try {
    const token = req.cookies.accessToken;
    const data = jwt.verify(token, publicKey, {
      algorithm: "RS256",
    });
    const userData = userDatabase.find((item) => {
      return item.email === data.email;
    });

    const { password, ...others } = userData;

    res.status(200).json(others);
  } catch (error) {
    res.status(500).json(error);
  }
};

// access token을 갱신하는 용도
const refreshToken = (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    const data = jwt.verify(token, publicKey, {
      algorithm: "RS256",
    });
    const userData = userDatabase.find((item) => {
      return item.email === data.email;
    });

    // access Token 새로 발급
    const accessToken = jwt.sign(
      {
        id: userData.id,
        username: userData.username,
        email: userData.email,
      },
      privateKey,
      {
        expiresIn: "5m",
        issuer: "star",
        algorithm: "RS256",
      }
    );

    // accessToken 쿠키
    res.cookie("accessToken", accessToken, {
      secure: false,
      httpOnly: true,
    });

    res.status(200).json("Access Token Recreated");
  } catch (error) {
    res.status(500).json(error);
  }
};

// 로그인 성공시 사용자 정보를 전달
const loginSuccess = (req, res) => {
  try {
    const token = req.cookies.accessToken;
    const data = jwt.verify(token, publicKey, {
      algorithm: "RS256",
    });

    const userData = userDatabase.find((item) => {
      return item.email === data.email;
    });

    res.status(200).json({
      user: userData,
      status: "login success page",
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

// 로그아웃 쿠키 삭제
const logout = (req, res) => {
  try {
    res.cookie("accessToken", "");
    res.cookie("refreshToken", "");
    res.status(200).json("Logout Success");
  } catch (error) {
    res.status(500).json(error);
  }
};

// module 내보냄
module.exports = {
  login,
  accessToken,
  refreshToken,
  loginSuccess,
  logout,
};
