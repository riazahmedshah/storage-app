export interface fileEntry {
  id: string;
  name: string;
  ext: string;
  parentDirId: string;
}

export interface dirEntry {
  id: string;
  name: string;
  parentDirId?: string | null;
  files: string[];
  directories: string[];
}