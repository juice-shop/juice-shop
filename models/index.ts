import { config } from 'dotenv';
config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  dialect: 'sqlite',
  retry: {
    match: [/SQLITE_BUSY/],
    name: 'query',
    max: 5
  },
  transactionType: 'IMMEDIATE',
  storage: 'data/juiceshop.sqlite',
  logging: false
})