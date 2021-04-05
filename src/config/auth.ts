export default {
  secret_token: process.env.JWT_SECRET,
  expires_in_token: process.env.JWT_EXPIRATION_TIME,
  secret_refresh_token: process.env.REFRESH_TOKEN_SECRET,
  expires_in_refresh_token: `${process.env.REFRESH_TOKEN_EXPIRATION_DAYS}d`,
  expires_in_refresh_token_days: process.env.REFRESH_TOKEN_EXPIRATION_DAYS,
};
