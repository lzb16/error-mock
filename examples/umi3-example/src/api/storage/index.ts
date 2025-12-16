import { createRequest } from '../../utils/request';
import type {
  UploadFileRequest,
  UploadFileResponse,
  ListFilesRequest,
  ListFilesResponse,
  DeleteFileRequest,
  DeleteFileResponse,
} from './_interface';

export const uploadFileUrl = '/api/storage/upload';
export const uploadFile = createRequest<UploadFileResponse, UploadFileRequest>({
  url: uploadFileUrl,
  method: 'POST',
});

export const listFilesUrl = '/api/storage/files';
export const listFiles = createRequest<ListFilesResponse, ListFilesRequest>({
  url: listFilesUrl,
  method: 'GET',
});

export const deleteFileUrl = '/api/storage/file';
export const deleteFile = createRequest<DeleteFileResponse, DeleteFileRequest>({
  url: deleteFileUrl,
  method: 'DELETE',
});

