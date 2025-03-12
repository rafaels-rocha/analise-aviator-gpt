require('dotenv').config();

module.exports = {
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  aposta1: {
    username: process.env.APOSTA1_USERNAME,
    password: process.env.APOSTA1_PASSWORD,
  },
};