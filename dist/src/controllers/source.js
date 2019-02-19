"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const code_1 = require("../code");
const multer = require("multer");
const planaend_source_1 = require("planaend-source");
const xlsx_1 = require("xlsx");
const collectionWrite_1 = require("../model/collectionWrite");
const globalData_1 = require("../globalData");
const collectionRead_1 = require("../model/collectionRead");
/**
 * 说明:
 * /source/:year
 * 管理源数据的上传和下载
 */
const Multer = multer({
    storage: multer.memoryStorage(),
    limits: {
        fieldNameSize: 15,
        fieldSize: 131072,
        files: 1,
        fileSize: 1310720,
        parts: 1966080,
    }
});
/**
 * 本文件中的路由地址
 */
exports.URL = '/source/:year';
/**
 * GET下对应的权限下标
 */
exports.LevelIndexOfGet = code_1.LevelCode.DownloadIndex.toString();
/**
 * POST下对应的权限下标
 */
exports.LevelIndexOfPost = code_1.LevelCode.UploadIndex.toString();
/**
 * 数据库名称前缀
 */
exports.DatabasePrefixName = 'source_';
/**
 * GET下的处理中间件
 */
exports.MiddlewaresOfGet = [(request, response, next) => {
        // 此时通过的请求都是经过session验证的请求
        // 此时挂载了logger 和 express-session 中间件
        // TODO 记录用户
        const year = request.params.year, databaseFullName = exports.DatabasePrefixName + year, collection = globalData_1.globalDataInstance.getMongoDatabase().collection(databaseFullName);
        collectionRead_1.collectionReadAllIfHave(collection).then((result) => {
            if (result) {
                const workBook = xlsx_1.utils.book_new();
                xlsx_1.utils.book_append_sheet(workBook, xlsx_1.utils.json_to_sheet(result), 'Sheet1');
                const file = xlsx_1.write(workBook, Object.assign(planaend_source_1.WriteOptions, { type: 'buffer' }));
                response.set('Content-Type', 'application/octet-stream');
                response.set('Content-Disposition', 'attachment;filename=' + encodeURI(`${year}.xlsx`));
                response.send(file);
                response.end();
            }
            else {
                return response.json({
                    message: code_1.responseMessage['错误:找不到文件'],
                    stateCode: 404
                });
            }
        }).catch((error) => {
            // 此处记录错误而不是使用next,错误中间件会执行destroy,
            // 但是我们的json数据有可能还没有发送完成
            request.logger.error(error.stack);
            return response.json({
                stateCode: 500,
                message: code_1.responseMessage['错误:服务器错误']
            });
        });
    }];
/**
 * POST下对应的处理中间件
 */
exports.MiddlewaresOfPost = [Multer.single('data'), (error, request, response, next) => {
        // 如果是multer的错误则记录错误
        if (error instanceof multer.MulterError) {
            request.logger.error(error.stack);
        }
        // 这里需要视为错误请求,即使用户是通过验证的情况下
        // 将所有的上传失败视为一种错误
        return next(code_1.ResponseErrorCode['错误:表单上传错误']);
    }, (request, response, next) => {
        const year = request.params.year;
        if (year.length !== 4) {
            // 不需要进行记录
            return response.json({
                message: code_1.responseMessage['错误:地址参数错误'],
                stateCode: 400
            });
        }
        // TODO 记录用户
        const workBook = xlsx_1.read(request.file.buffer, Object.assign(planaend_source_1.ParseOptions, {
            type: 'buffer'
        })), workSheet = planaend_source_1.getDefaultSheets(workBook);
        if (workSheet && planaend_source_1.checkSourceData(workSheet)) {
            collectionWrite_1.writeForSource(globalData_1.globalDataInstance.getMongoDatabase(), xlsx_1.utils.sheet_to_json(workSheet), year).then(({ result }) => {
                if (result.ok !== 1) {
                    request.logger.error(`${code_1.SystemErrorCode['错误:数据库写入失败']} DIR:${__dirname} CollectionName:${exports.DatabasePrefixName + year} userID:${request.session.userId}`);
                }
            }).catch(next);
            return response.json({
                message: code_1.responseMessage['源数据上传成功'],
                stateCode: 200
            });
        }
        // TODO 记录用户行为
        return response.json({
            message: code_1.responseMessage['错误:数据校验错误'],
            stateCode: 400
        });
    }];
// TODO JSON通过这个接口
// export const url = '/source/json/:year'
