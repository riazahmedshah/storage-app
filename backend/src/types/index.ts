export interface fileEntry {
  id: string;
  name: string;
  ext: string;
  parentDirId: string;
}

export interface dirEntry {
  id: string;
  name: string;
  userId:string;
  parentDirId?: string | null;
  files: string[];
  directories: string[];
}

export interface userEntry{
  id: string;
  name:string;
  email:string;
  password: string;
  rootDirId:string;
}