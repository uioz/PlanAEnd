"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const code_1 = require("../code");
const multer = require("multer");
const planaend_source_1 = require("planaend-source");
const xlsx_1 = require("xlsx");
const collectionWrite_1 = require("../model/collectionWrite");
const globalData_1 = require("../globalData");
const utils_1 = require("../model/utils");
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
        // TODO 记录用户
        const year = request.params.year, collectionList = utils_1.listCollectionsNameOfDatabase(globalData_1.globalDataInstance.getMongoDatabase());
        // TODO 等待编写 是否存在数据库 直接查看状态就可以了stats
        console.log(collectionList);
        return response.json({
            message: 'success',
            stateCode: 200
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
        // 将所有的上传失败视为一种错误
        return next(code_1.ResponseErrorCode['错误:表单上传错误']);
    }, (request, response, next) => {
        // TODO 记录用户
        const workBook = xlsx_1.read(request.file.buffer, planaend_source_1.ParseOptions), workSheet = planaend_source_1.getDefaultSheets(workBook), year = request.params.year;
        if (year.length !== 4) {
            return next(code_1.ResponseErrorCode['错误:地址参数错误']);
        }
        if (workSheet && planaend_source_1.checkSourceData(workSheet)) {
            collectionWrite_1.writeForSource(globalData_1.globalDataInstance.getMongoDatabase(), xlsx_1.utils.sheet_to_json(workSheet), year).then(writeResult => {
                console.log(writeResult);
            }).catch((error) => {
                request.logger.error(error.stack);
                next(code_1.ResponseErrorCode['错误:源数据写入失败']);
            });
            return response.json({
                message: `源数据上传成功`,
                stateCode: 200
            });
        }
        return next(code_1.ResponseErrorCode['错误:数据校验错误']);
    }];
// TODO JSON通过这个接口
// export const url = '/source/json/:year'
