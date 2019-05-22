import * as Multer from "multer";

/**
 * 获取一个Image图片存储器, 基于`Multer.diskStorage`API.  
 * @param path 路径
 */
export const ImageDiskStorageGenerator = (path: string) => {
  return Multer.diskStorage({
    destination(request, file, callback) {
      callback(null, path);
    },
    filename(request, file, callback) {
      callback(null, file.fieldname + '-' + Date.now())
    }
  })
};
