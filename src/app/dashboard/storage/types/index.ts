export interface FileItem {
  id: string;
  fileName: string;
  fileType: string;
  createdAt: string;
  shared?: boolean;
  starred?: boolean;
  sharedWith?: string;
  size?: string;
  type?: string;
  previewUrl?: string;
}
