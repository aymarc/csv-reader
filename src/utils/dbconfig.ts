import pg from "pg";
import config from "../config";

const dbConfig = {
  user: config.POSTGRES_USER,
  host: config.POSTGRES_HOST,
  database: config.POSTGRES_DB,
  password: config.POSTGRES_PASSWORD,
  port: 5432,
};
const client = new pg.Client(dbConfig);

export default client;
