import * as Multer from "multer";
import {getExtension} from "mime";

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
      callback(null, `${Date.now()}-${Math.random() * 10000}.${getExtension(file.mimetype)}`);
    }
  })
}

/**
 * Multer 图片文件类型过滤器
 * @param request 请求对象
 * @param file 文件对象
 * @param callback 回掉对象
 */
export const normalImageFilter = (request,file,callback)=>{

  const passType = new Set(['jpg','png']);

  if (passType.has(getExtension(file.mimetype))){
    callback(null,true);
  }else{
    callback(new Error(`File type must be equal 'jpg' or 'png'`));
  }

}
