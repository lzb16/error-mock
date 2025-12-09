export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  url: string;
}

export interface UploadFileRequest {
  file: File;
  folder?: string;
}

export interface UploadFileResponse {
  file: FileInfo;
}

export interface ListFilesRequest {
  folder?: string;
  page?: number;
  pageSize?: number;
}

export interface ListFilesResponse {
  files: FileInfo[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DeleteFileRequest {
  id: string;
}

export interface DeleteFileResponse {
  success: boolean;
}
