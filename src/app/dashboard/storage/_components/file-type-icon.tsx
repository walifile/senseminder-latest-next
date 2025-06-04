import React from "react";
import { getFileIcon } from "../utils";

const getRandomColor = () => {
  const r = Math.floor(Math.random() * 256)
    .toString(16)
    .padStart(2, "0");
  const g = Math.floor(Math.random() * 256)
    .toString(16)
    .padStart(2, "0");
  const b = Math.floor(Math.random() * 256)
    .toString(16)
    .padStart(2, "0");
  return `#${r}${g}${b}`;
};

const FileTypeIcon = ({
  index,
  fileName,
  fileType,
  size = "small",
}: {
  index: number;
  fileName: string;
  fileType: string;
  size?: "small" | "large";
}) => {
  const IconComponent = getFileIcon(fileName, fileType);

  const folderColor = fileType === "folder" ? getRandomColor() : undefined;

  return (
    <div
      className={`flex items-center justify-center ${
        size === "small" ? "h-5 w-5" : "h-8 w-8"
      }`}
    >
      <IconComponent
        className={`w-full h-full text-primary`}
        style={folderColor ? { color: folderColor } : undefined}
      />
    </div>
  );
};

export default FileTypeIcon;
