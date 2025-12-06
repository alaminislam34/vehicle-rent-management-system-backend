import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

interface Config {
  env: String | undefined;
  port: Number;
}

const config: Config = {
  env: process.env.NODE_ENV,
  port: Number(process.env.PORT) || 5000,
};

export default config;
