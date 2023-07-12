# 로그인 API 서비스 제작

JWT, Access Token 구현

엔드포인트 API 서버 구조


API 명세서 : https://documenter.getpostman.com/view/28412814/2s946cgujv#intro

## 개발 환경

### vscode
#### Node.js
1. exprss
2. dotenv
3. jsonwebtoken
4. cookie-parser
5. nodemon


## 시작 가이드

### git 연동

```sh
$ git clone https://github.com/docixjk/starLawFirmPretask.git
```

### 의존성 설치

```sh
$ npm install
```

### 실행

```sh
npm start
```

## 필요 사항

.env 파일 필요
#### 개인키와 공개키는 백틱( ` )으로 감싸야합니다

```sh
PORT=8008
RSA_PRIVATEKEY=`개인 키`
RSA_PUBLICKEY=`공개 키`
```


## 개발 내역

* 23.07.12
    * Git hub README.md 작성
* 23.07.11
    * 필요사항 질문 및 코드 수정
* 23.07.09 ~ 10
    * 로그인, JWT(access token, refresh token) 구현
* 23.07.07 ~ 08
    * 관련 내용 검색 및 로직 수립



## 구현 기능

* 로그인
  * 이메일과 비밀번호 확인
  * 로그인 성공시 결과, 로그아웃

* JWT
  * access token, refresh token 발급 및 쿠키

