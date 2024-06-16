export default () => ({
  port: process.env.PORT || 8080,
  jwt_secret: process.env.JWT_SECRET,
  cors_url: process.env.CLIENT_URL,
});
