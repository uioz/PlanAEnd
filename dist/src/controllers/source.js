"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const code_1 = require("../code");
const multer = require("multer");
const planaend_source_1 = require("planaend-source");
const xlsx_1 = require("xlsx");
const collectionWrite_1 = require("../model/collectionWrite");
const globalData_1 = require("../globalData");
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
 * 数据处理地址
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
 * GET下的处理中间件
 */
exports.MiddlewaresOfGet = [(request, response) => {
        // 此时通过的请求都是经过session验证的请求
        // 此时挂载了logger 和 express-session 中间件
        return response.end('200 ok');
    }];
/**
 * POST下对应的处理中间件
 */
exports.MiddlewaresOfPost = [Multer.single('data'), (error, request, response, next) => {
        // 如果是multer的错误则记录错误
        if (error instanceof multer.MulterError) {
            request.logger.error(error.stack);
        }
        // 将所有的上传失败视为一种错误
        return next(code_1.FilterCode['错误:表单上传错误']);
    }, (request, response, next) => {
        // TODO 记录用户
        const workBook = xlsx_1.read(request.file.buffer, planaend_source_1.ParseOptions), workSheet = planaend_source_1.getDefaultSheets(workBook);
        if (workSheet && planaend_source_1.checkSourceData(workSheet)) {
            // TODO 写入到数据库
            process.nextTick(() => {
                collectionWrite_1.writeToCollection(globalData_1.globalDataInstance.getMongoDatabase());
            });
            return response.end('200 ok');
        }
        return next(code_1.FilterCode['错误:数据校验错误']);
    }];
