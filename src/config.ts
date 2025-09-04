interface IConfig {
    PORT: number;
    POSTGRES_USER:  string | undefined;
    POSTGRES_PASSWORD: string | undefined;
    POSTGRES_DB: string | undefined;
    REDIS_PORT: number ;
}

const config: IConfig = {
    PORT: parseInt(process.env.PORT || "") || 5000,
    POSTGRES_USER: process.env.POSTGRES_USER || "",
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || "",
    POSTGRES_DB: process.env.POSTGRES_DB || "",
    REDIS_PORT: parseInt(process.env.REDIS_PORT || "") || 0
}

export default config;