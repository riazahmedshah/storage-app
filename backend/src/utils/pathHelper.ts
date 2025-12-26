import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));


export const getPublicPath = (...paths: string[]): string => {
  return path.join(__dirname, '..', 'public', ...paths);
}

export const getSrcPath = (): string => {
  return path.join(__dirname, '../', );
};