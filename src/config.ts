interface IConfig {
  PORT: number;
  POSTGRES_USER: string | undefined;
  POSTGRES_PASSWORD: string | undefined;
  POSTGRES_DB: string | undefined;
  POSTGRES_HOST: string | undefined;
  POSTGRES_PORT: string | undefined;
  REDIS_PORT: number;
  API_VERSION: string;
}

const config: IConfig = {
  PORT: parseInt(process.env.PORT || "") || 5000,
  POSTGRES_USER: process.env.POSTGRES_USER || "",
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || "",
  POSTGRES_DB: process.env.POSTGRES_DB || "",
  POSTGRES_HOST: process.env.POSTGRESS_HOST,
  POSTGRES_PORT: process.env.POSTGRES_PORT,
  REDIS_PORT: parseInt(process.env.REDIS_PORT || "") || 0,
  API_VERSION: "/api/v1",
};

export default config;