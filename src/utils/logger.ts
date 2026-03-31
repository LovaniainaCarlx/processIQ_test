import { createLogger, format, transports } from "winston";

export const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json() // JSON structuré
  ),
  defaultMeta: { service: "pdf-generator" },
  transports: [
    new transports.Console(), // peut ajouter File transport si besoin
  ],
});