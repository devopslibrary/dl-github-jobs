import * as pino from "pino";

export const parentLogger = pino({
  name: "dl-github-jobs",
  level: process.env.LEVEL || "info"
});
