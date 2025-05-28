import React from "react";
import { getFileIcon } from "../utils";

const folderColors = [
  "#FF6633",
  "#FF33FF",
  "#00B3E6",
  "#E6B333",
  "#3366E6",
  "#999966",
  "#99FF99",
  "#B34D4D",
  "#80B300",
  "#809900",
  "#E6B3B3",
  "#6680B3",
  "#66991A",
  "#FF99E6",
  "#CCFF1A",
  "#FF1A66",
  "#E6331A",
  "#33FFCC",
  "#66994D",
  "#B366CC",
  "#4D8000",
  "#B33300",
  "#CC80CC",
  "#66664D",
  "#991AFF",
];

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

  return (
    <div
      className={`flex items-center justify-center ${
        size === "small" ? "h-5 w-5" : "h-8 w-8"
      }`}
    >
      <IconComponent
        className={`w-full h-full text-primary`}
        style={
          fileType === "folder" ? { color: folderColors[index] } : undefined
        }
      />
    </div>
  );
};

export default FileTypeIcon;
