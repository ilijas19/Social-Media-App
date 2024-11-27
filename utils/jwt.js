const jwt = require("jsonwebtoken");

const createJwt = ({ payload }) => {
  return jwt.sign(payload, process.env.JWT_SECRET);
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const attachCookiesToResponse = ({ res, user, refreshToken }) => {
  const accessTokenJwt = createJwt({ payload: { user } });
  const refreshTokenJwt = createJwt({ payload: user, refreshToken });

  const oneDay = 1000 * 60 * 60 * 24;
  const oneWeek = 1000 * 60 * 60 * 24 * 7;

  res.cookie("accessToken", accessTokenJwt, {
    httpOnly: true,
    signed: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === "production",
  });

  res.cookie("refreshToken", refreshTokenJwt, {
    httpOnly: true,
    signed: true,
    expires: new Date(Date.now() + oneWeek),
    secure: process.env.NODE_ENV === "production",
  });
};

module.exports = {
  verifyToken,
  attachCookiesToResponse,
};
