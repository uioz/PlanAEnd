import { LevelCode, FilterCode } from "../code";
import { Middleware,ErrorMiddleware } from "../types";
import * as multer from "multer";
import { checkSourceData,ParseOptions } from "planaend-source";
import { Logger } from "log4js";
import { read as XlsxRead } from "xlsx";

const Multer = multer({
    storage: multer.memoryStorage(),
    limits:{
        fieldNameSize:15, // 字段名字的长度
        fieldSize: 131072, // 字段最大大小 1Mib
        files:1, // 文件最大数量
        fileSize: 1310720, // 单个文件大小10Mib
        parts: 1966080, // fields + files的最大大小 15Mib
    }
});

/**
 * 数据处理地址
 */
export const URL = '/source';
/**
 * GET下对应的权限下标
 */
export const LevelIndexOfGet = LevelCode.DownloadIndex.toString();
/**
 * POST下对应的权限下标
 */
export const LevelIndexOfPost = LevelCode.UploadIndex.toString();

/**
 * GET下的处理中间件
 */
export const MiddlewaresOfGet:Array<Middleware> = [(request,response)=>{

    // 此时通过的请求都是经过session验证的请求
    // 此时挂载了logger 和 express-session 中间件

    return response.end('200 ok');
    
}]

/**
 * POST下对应的处理中间件
 */
export const MiddlewaresOfPost: Array<Middleware | ErrorMiddleware> = [Multer.single('data'),(error,request,response,next)=>{

    // 如果是multer的错误则记录错误
    if ((error as any) instanceof (multer as any).MulterError){
        ((request as any).logger as Logger).error((error as any).stack);
    }
    // 将所有的上传失败视为一种错误
    next(FilterCode['错误:表单上传错误']);

},(request,response,next)=>{

    // TODO 记录用户
    const xlsx = XlsxRead(request.file.buffer,ParseOptions)
    

    return response.end('200 ok');
}];