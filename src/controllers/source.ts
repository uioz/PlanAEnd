import { LevelCode, ResponseErrorCode } from "../code";
import { Middleware,ErrorMiddleware,restrictResponse } from "../types";
import * as multer from "multer";
import { checkSourceData,ParseOptions,getDefaultSheets } from "planaend-source";
import { Logger } from "log4js";
import { read as XlsxRead,utils as XlsxUtils } from "xlsx";
import { writeForSource } from "../model/collectionWrite";
import { globalDataInstance } from "../globalData";
import { listCollectionsNameOfDatabase } from '../model/utils'

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
export const URL = '/source/:year';
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
    // TODO 记录用户

    const 
        year:string = request.params.year,
        collectionList = listCollectionsNameOfDatabase(globalDataInstance.getMongoDatabase());
// TODO 等待编写 是否存在数据库 直接查看状态就可以了stats
    console.log(collectionList)

    return response.json({
        message:'success',
        stateCode:200
    } as restrictResponse)
    
}];

/**
 * POST下对应的处理中间件
 */
export const MiddlewaresOfPost: Array<Middleware | ErrorMiddleware> = [Multer.single('data'),(error,request,response,next)=>{

    // 如果是multer的错误则记录错误
    if ((error as any) instanceof (multer as any).MulterError){
        ((request as any).logger as Logger).error((error as any).stack);
    }
    // 将所有的上传失败视为一种错误
    return next(ResponseErrorCode['错误:表单上传错误']);

},(request,response,next)=>{

    // TODO 记录用户
    const 
        workBook = XlsxRead(request.file.buffer,ParseOptions),
        workSheet = getDefaultSheets(workBook),
        year:string = request.params.year;

    if(year.length !== 4){
        return next(ResponseErrorCode['错误:地址参数错误']);
    }
    
    if(workSheet && checkSourceData(workSheet)){
        
        writeForSource(globalDataInstance.getMongoDatabase(), XlsxUtils.sheet_to_json(workSheet),year).then(writeResult=>{
            console.log(writeResult);
        }).catch((error)=>{
            request.logger.error(error.stack);
            next(ResponseErrorCode['错误:源数据写入失败']);
        });

        return response.json({
            message:`源数据上传成功`,
            stateCode:200
        } as restrictResponse)
    }

    return next(ResponseErrorCode['错误:数据校验错误']);

}];

// TODO JSON通过这个接口
// export const url = '/source/json/:year'