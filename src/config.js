import dotenv from 'dotenv';
dotenv.config();

export const config = {
  db: {
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASS,
    database: process.env.PG_DB,
    port: process.env.PG_PORT || 5432
  },
  aws: { region: process.env.AWS_REGION || 'us-east-1' },
  firebaseCredPath: process.env.FIREBASE_CREDENTIAL || './firebase.json'
};
