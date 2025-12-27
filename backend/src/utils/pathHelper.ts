import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const getPublicPath = (paths?: string): string => {
  if(paths){
    return path.join(__dirname, '..', 'public', paths);
  }else{
    return path.join(__dirname, '..', 'public');
  }
  
}

export const getSrcPath = (): string => {
  return path.join(__dirname, '../', );
};
