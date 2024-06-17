export default () => ({
  PORT: process.env.PORT || 8080,
  JWT_SECRET: process.env.JWT_SECRET,
  CORS_CLIENT_URL: process.env.CLIENT_URL,
  EXPIRED_DURATION: {
    ACCESS_TOKEN: process.env.ACCESS_EXPIRE_DURATION,
    REFRESH_TOKEN: process.env.REFRESH_EXPIRE_DURATION,
  },
});
