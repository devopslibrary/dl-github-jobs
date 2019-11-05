import * as pino from "pino";

export const logger = pino({
  name: "dl-github-jobs",
  level: process.env.LEVEL || "info"
});
