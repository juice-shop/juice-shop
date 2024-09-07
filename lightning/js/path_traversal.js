import url from "url";
import path from 'path';

const BASE_DIR = '/wwwroot';

export function getFileSystemPath(inputUrl) {
  const urlPath = url.parse(inputUrl).pathname;
  return path.join(BASE_DIR, urlPath);
}