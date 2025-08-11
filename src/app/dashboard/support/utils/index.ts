export const sanitizeFilename = (filename: string) => {
  let name = filename.split("/").pop() || "file";
  name = name.replace(/[^A-Za-z0-9._-]/g, "_").replace(/_+/g, "_");
  return name.slice(0, 50);
};
