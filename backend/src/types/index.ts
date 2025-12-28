export interface fileEntry {
  id: string;
  name: string;
  ext: string;
  parentDir: string;
}

export interface dirEntry {
  id: string;
  name: string;
  parentDir: string | null;
  files: string[];
  directories: string[];
}