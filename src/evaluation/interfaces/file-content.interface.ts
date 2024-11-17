export interface FileContent {
  type?: string;
  filename?: string;
  filepath: string; 
  filesize?: number;
  fileurl?: string;
  timecreated?: number;
  timemodified?: number;
  sortorder?: number;
  mimetype?: string;
  isexternalfile?: boolean;
  userid?: number;
  author?: string;
  license?: string;
}
