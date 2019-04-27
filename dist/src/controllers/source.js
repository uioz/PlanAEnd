"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const code_1 = require("../code");
const multer = require("multer");
const planaend_source_1 = require("planaend-source");
const xlsx_1 = require("xlsx");
const collectionWrite_1 = require("../model/collectionWrite");
const globalData_1 = require("../globalData");
const public_1 = require("./public");
/**
 * 说明:
 * /source/:year
 * 管理源数据的上传和下载
 */
/**
* 用于检测url中的参数数值是否在合理范围区间内
* @param number 整形数值
*/
exports.checkNumber = number => number !== NaN && number >= 0 && number < Number.MAX_SAFE_INTEGER;
/**
 * 源数据上传配置
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
 * 本模块对应的URL地址
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
 * 利用session中提供的数据获取对应的query对象
 * @param session session对象
 */
exports.correctQuery = (session) => {
    const isAdmin = session.level === 0, controlAll = session.controlArea.length === 0, query = isAdmin || controlAll ? {} : { speciality: { $in: session.controlArea } };
    return query;
};
/**
 * GET下的处理中间件
 */
exports.MiddlewaresOfGet = [(request, response) => {
        // 此时通过的请求都是经过session验证的请求
        // 此时挂载了logger 和 express-session 中间件
        const year = request.params.year, databaseFullName = exports.DatabasePrefixName + year, collection = globalData_1.globalDataInstance.getMongoDatabase().collection(databaseFullName), query = exports.correctQuery(request.session), resultArray = [];
        collection.find(query, {
            projection: {
                _id: 0
            }
        }).forEach(itemObj => resultArray.push(itemObj), () => {
            if (resultArray.length) {
                try {
                    const workBook = xlsx_1.utils.book_new();
                    xlsx_1.utils.book_append_sheet(workBook, xlsx_1.utils.json_to_sheet(resultArray), 'Sheet1');
                    const file = xlsx_1.write(workBook, Object.assign(planaend_source_1.WriteOptions, { type: 'buffer' }));
                    response.set('Content-Type', 'application/octet-stream');
                    response.set('Content-Disposition', 'attachment;filename=' + encodeURI(`${year}.xlsx`));
                    response.send(file).end();
                }
                catch (error) {
                    public_1.code500(response);
                    public_1.logger500(request.logger, request.params, code_1.SystemErrorCode['错误:数据转换失败'], error);
                    return public_1.code500(response);
                }
            }
            else {
                return public_1.responseAndTypeAuth(response, {
                    message: code_1.responseMessage['错误:找不到文件'],
                    stateCode: 404
                });
            }
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
        const year = parseInt(request.params.year);
        if (!year || year !== year) {
            return public_1.code400(response);
        }
        const workBook = xlsx_1.read(request.file.buffer, Object.assign(planaend_source_1.ParseOptions, {
            type: 'buffer'
        })), workSheet = planaend_source_1.getDefaultSheets(workBook), isAdmin = request.session.level === 0, controlAll = request.session.controlArea.length === 0;
        if (workSheet && planaend_source_1.checkSourceData(workSheet)) {
            // 数组化工作表
            const arrayizeWorkSheet = planaend_source_1.transformLevelToArray(xlsx_1.utils.sheet_to_json(workSheet), planaend_source_1.getLevelIndexs(workSheet));
            // 利用控制区域字段来过滤上传的内容
            const jsonizeSourceData = isAdmin || controlAll ? arrayizeWorkSheet : planaend_source_1.correctSpeciality(arrayizeWorkSheet, request.session.controlArea);
            collectionWrite_1.writeOfSource(globalData_1.globalDataInstance.getMongoDatabase().collection(exports.DatabasePrefixName + year), jsonizeSourceData).then((results) => {
                for (const insertResult of results) {
                    if (insertResult.result.ok === 1) {
                        public_1.responseAndTypeAuth(response, {
                            stateCode: 200,
                            data: {
                                total: arrayizeWorkSheet.length,
                                real: jsonizeSourceData.length
                            },
                            message: code_1.responseMessage['数据上传成功']
                        });
                        request.logger.error(`${code_1.SystemErrorCode['错误:数据库写入失败']} DIR:${__dirname} CollectionName:${exports.DatabasePrefixName + year} userID:${request.session.userId}`);
                    }
                    else {
                        public_1.logger500(request.logger, workSheet, code_1.SystemErrorCode['错误:数据库回调异常']);
                        public_1.code500(response, code_1.responseMessage['错误:表单上传错误']);
                    }
                }
            }).catch((error) => {
                public_1.logger500(request.logger, workSheet, code_1.SystemErrorCode['错误:数据库写入失败'], error);
                public_1.code500(response, code_1.responseMessage['错误:服务器错误']);
            });
        }
        return public_1.code400(response);
    }];
