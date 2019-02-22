import { LevelCode, ResponseErrorCode, responseMessage, SystemErrorCode } from "../code";
import { Middleware, ErrorMiddleware, restrictResponse } from "../types";
import * as multer from "multer";
import { checkSourceData, ParseOptions, getDefaultSheets, WriteOptions } from "planaend-source";
import { Logger } from "log4js";
import { read as XlsxRead, utils as XlsxUtils, write as XlsxWrite } from "xlsx";
import { writeOfSource } from "../model/collectionWrite";
import { globalDataInstance } from "../globalData";
import { collectionReadAllIfHave } from "../model/collectionRead";
import { InsertWriteOpResult } from "mongodb";


/**
 * 说明:
 * /source/:year
 * 管理源数据的上传和下载
 */


/**
* 用于检测url中的参数数值是否在合理范围区间内
* @param number 整形数值
*/
export const checkNumber = number => number !== NaN && number > 0 && number < Number.MAX_SAFE_INTEGER;

/**
 * 源数据上传配置
 */
const Multer = multer({
    storage: multer.memoryStorage(),
    limits: {
        fieldNameSize: 15, // 字段名字的长度
        fieldSize: 131072, // 字段最大大小 1Mib
        files: 1, // 文件最大数量
        fileSize: 1310720, // 单个文件大小10Mib
        parts: 1966080, // fields + files的最大大小 15Mib
    }
});

/**
 * 本文件中的路由地址
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
 * 数据库名称前缀
 */
export const DatabasePrefixName = 'source_';

/**
 * GET下的处理中间件
 */
export const MiddlewaresOfGet: Array<Middleware> = [(request, response, next) => {

    // 此时通过的请求都是经过session验证的请求
    // 此时挂载了logger 和 express-session 中间件

    // TODO 记录用户

    const
        year: string = request.params.year,
        databaseFullName = DatabasePrefixName + year,
        collection = globalDataInstance.getMongoDatabase().collection(databaseFullName);

    collectionReadAllIfHave(collection).then((result: Array<object>) => {

        if (result) {

            const workBook = XlsxUtils.book_new();

            XlsxUtils.book_append_sheet(workBook, XlsxUtils.json_to_sheet(result), 'Sheet1');

            const file = XlsxWrite(workBook, Object.assign(WriteOptions, { type: 'buffer' }))
            response.set('Content-Type', 'application/octet-stream');
            response.set('Content-Disposition', 'attachment;filename=' + encodeURI(`${year}.xlsx`));
            response.send(file);
            response.end();

        } else {
            return response.json({
                message: responseMessage['错误:找不到文件'],
                stateCode: 404
            });
        }

    }).catch((error) => {

        // 此处记录错误而不是使用next,错误中间件会执行destroy,
        // 但是我们的json数据有可能还没有发送完成
        (request as any).logger.error(error.stack);

        return response.json({
            stateCode: 500,
            message: responseMessage['错误:服务器错误']
        });

    });

}];

/**
 * POST下对应的处理中间件
 */
export const MiddlewaresOfPost: Array<Middleware | ErrorMiddleware> = [Multer.single('data'), (error, request, response, next) => {

    // 如果是multer的错误则记录错误
    if ((error as any) instanceof (multer as any).MulterError) {
        ((request as any).logger as Logger).error((error as any).stack);
    }
    // 这里需要视为错误请求,即使用户是通过验证的情况下
    // 将所有的上传失败视为一种错误
    return next(ResponseErrorCode['错误:表单上传错误']);

}, (request, response, next) => {

    // 过滤地址上的杂物.
    const year = String(parseInt(request.params.year));

    // 判断是否处于正常区间
    if (!checkNumber(parseInt(year))) {
        return response.json({
            message: responseMessage['错误:地址参数错误'],
            stateCode: 400
        } as restrictResponse);
    }

    // TODO 记录用户
    const
        workBook = XlsxRead(request.file.buffer, Object.assign(ParseOptions, {
            type: 'buffer'
        })),
        workSheet = getDefaultSheets(workBook);


    if (workSheet && checkSourceData(workSheet)) {

        writeOfSource(globalDataInstance.getMongoDatabase(), XlsxUtils.sheet_to_json(workSheet), year).then((results: Array<InsertWriteOpResult>) => {

            for (const insertResult of results) {
                if (insertResult.result.ok !== 1) {
                    request.logger.error(`${SystemErrorCode['错误:数据库写入失败']} DIR:${__dirname} CollectionName:${DatabasePrefixName + year} userID:${request.session.userId}`);
                }
            }

        }).catch(next);

        return response.json({
            message: responseMessage['源数据上传成功'],
            stateCode: 200
        } as restrictResponse)
    }

    // TODO 记录用户行为
    return response.json({
        message: responseMessage['错误:数据校验错误'],
        stateCode: 400
    } as restrictResponse)

}];
