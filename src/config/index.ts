import { readFileSync } from "fs";
import { envs } from "./envs/index";
import loggerConfig from "./logger/index";
import mongooseConfig from "./mongoose/index";

export const config: Partial<TsED.Configuration> = {
  envs,
  logger: loggerConfig,
  mongoose: mongooseConfig, // undefined does also work
  // additional shared configuration
};
