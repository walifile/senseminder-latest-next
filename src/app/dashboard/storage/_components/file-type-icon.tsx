import React from "react";
import { getFileIcon } from "../utils";

const FileTypeIcon = ({
  fileName,
  fileType,
  size = "small",
}: {
  fileName: string;
  fileType: string;
  size?: "small" | "large";
}) => {
  const IconComponent = getFileIcon(fileName, fileType);
  return (
    <div
      className={`flex items-center justify-center ${
        size === "small" ? "h-5 w-5" : "h-8 w-8"
      }`}
    >
      <IconComponent className="w-full h-full text-primary" />
    </div>
  );
};

export default FileTypeIcon;
