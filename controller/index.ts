import { Request, Response } from "express";
import jwt, { VerifyErrors } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const publicKey: string = process.env.RSA_PUBLICKEY || "";
const privateKey: string = process.env.RSA_PRIVATEKEY || "";

interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  refreshToken: string;
}

const userDatabase: User[] = [
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

/**
 * 로그인 처리를 수행하는 함수입니다.
 * 클라이언트로부터 전송된 이메일과 비밀번호를 확인하여 인증을 수행하고, 인증이 성공한 경우 액세스 토큰과 리프레시 토큰을 발급하여 전송합니다.
 *
 * @param req - Express의 Request 객체
 * @param res - Express의 Response 객체
 */
export const login = (req: Request, res: Response): void => {
  // 요청 데이터에서 이메일과 비밀번호를 추출합니다.
  const { email, password } = req.body;

  // 사용자 데이터베이스에서 이메일과 비밀번호가 일치하는 사용자 정보를 검색합니다.
  const userInfo: User | undefined = userDatabase.find((item) => {
    return item.email === email && item.password === password;
  });

  // 사용자 정보가 없는 경우 403 Forbidden 에러를 응답합니다.
  if (!userInfo) {
    res.status(403).json("Not Authorized");
  } else {
    try {
      // 액세스 토큰을 발급합니다.
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

      // 리프레시 토큰을 발급합니다.
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

      // 생성된 리프레시 토큰을 사용자 정보에 저장합니다.
      const userData = userDatabase.find((item) => {
        return item.email === userInfo.email;
      });
      if (userData) {
        userData.refreshToken = refreshToken;
      }

      // 발급된 액세스 토큰과 리프레시 토큰을 쿠키로 설정하여 전송합니다.
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
      // 서버 에러가 발생한 경우 에러 응답을 전송합니다.
      res.status(500).json(error);
    }
  }
};

/**
 * 액세스 토큰을 사용하여 사용자 정보에 접근하는 함수입니다.
 * 액세스 토큰을 확인하고 해당 토큰에 대응하는 사용자 정보를 검색하여 반환합니다.
 *
 * @param req - Express의 Request 객체
 * @param res - Express의 Response 객체
 */
export const accessToken = (req: Request, res: Response): void => {
  try {
    // 액세스 토큰을 가져옵니다.
    const token: string | undefined = req.cookies.accessToken;

    if (!token) {
      res.status(403).json("Access token not found");
      return;
    }

    // 액세스 토큰을 검증하고 해당 토큰에 대응하는 사용자 정보를 추출합니다.
    const data = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
    }) as { email: string };

    const userData = userDatabase.find((item) => {
      return item.email === data.email;
    });

    // 사용자가 존재하는 경우 비밀번호를 제외한 사용자 정보를 반환합니다.
    if (userData) {
      const { password, ...others } = userData;
      res.status(200).json(others);
    } else {
      res.status(403).json("User not found");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

/**
 * 액세스 토큰을 갱신하는 함수입니다.
 * 리프레시 토큰을 확인하고 해당 토큰에 대응하는 사용자 정보를 검색하여 새로운 액세스 토큰을 발급합니다.
 *
 * @param req - Express의 Request 객체
 * @param res - Express의 Response 객체
 */
export const refreshToken = (req: Request, res: Response): void => {
  try {
    const token: string | undefined = req.cookies.refreshToken;

    if (!token) {
      res.status(403).json("Refresh token not found");
      return;
    }

    const data = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
    }) as { email: string };

    const userData = userDatabase.find((item) => {
      return item.email === data.email;
    });

    // 사용자가 존재하는 경우 액세스 토큰을 새로 발급합니다.
    if (userData) {
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

      // 발급된 액세스 토큰을 쿠키로 설정합니다.
      res.cookie("accessToken", accessToken, {
        secure: false,
        httpOnly: true,
      });

      res.status(200).json("Access Token Recreated");
    } else {
      res.status(403).json("User not found");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

/**
 * 로그인 성공 페이지를 처리하는 함수입니다.
 * 액세스 토큰을 확인하고 해당 토큰에 대응하는 사용자 정보를 검색하여 로그인 성공 페이지를 반환합니다.
 *
 * @param req - Express의 Request 객체
 * @param res - Express의 Response 객체
 */
export const loginSuccess = (req: Request, res: Response): void => {
  try {
    const token: string | undefined = req.cookies.accessToken;

    if (!token) {
      res.status(403).json("Access token not found");
      return;
    }

    const data = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
    }) as { email: string };

    const userData = userDatabase.find((item) => {
      return item.email === data.email;
    });

    // 사용자가 존재하는 경우 로그인 성공 페이지와 사용자 정보를 응답합니다.
    if (userData) {
      res.status(200).json({
        user: userData,
        page: "login success page",
      });
    } else {
      res.status(403).json("User not found");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

/**
 * 로그아웃 처리를 수행하는 함수입니다.
 * 현재 세션의 액세스 토큰과 리프레시 토큰을 삭제하여 로그아웃을 완료합니다.
 *
 * @param req - Express의 Request 객체
 * @param res - Express의 Response 객체
 */
export const logout = (req: Request, res: Response): void => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json("Logout Success");
  } catch (error) {
    res.status(500).json(error);
  }
};
