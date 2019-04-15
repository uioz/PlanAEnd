"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const code_1 = require("../code");
const globalData_1 = require("../globalData");
const collectionUpdate_1 = require("../model/collectionUpdate");
const collectionWrite_1 = require("../model/collectionWrite");
const public_1 = require("./public");
const public_2 = require("./public");
const assets_1 = require("./assets");
/**
 * 简介:
 * 本模块用于管理专业模型的获取和修改
 * /model
 */
/**
 * 本模块对应的URL地址
 */
exports.URL = '/model';
/**
 * GET 对应的权限下标(不需要权限,但是需要登录)
 */
exports.LevelIndexOfGet = '';
/**
 * POST 对应的权限下标
 */
exports.LevelIndexOfPost = code_1.LevelCode.EditIndex.toString();
/**
 * 数据库名称
 */
exports.CollectionName = 'model_speciality';
/**
 * GET 对应的中间件
 */
exports.MiddlewaresOfGet = [
    (request, response, next) => {
        // 此时通过的请求都是经过session验证的请求
        // 此时挂载了logger 和 express-session 中间件
        const collection = globalData_1.globalDataInstance.getMongoDatabase().collection(exports.CollectionName);
        public_1.autoReadOne(collection, response, request.logger).then((findResult) => {
            if (findResult) {
                // 如果是超级管理员直接返回获取到的内容
                if (request.session.level === 0) {
                    return public_1.responseAndTypeAuth(response, {
                        message: findResult,
                        stateCode: 200
                    });
                }
                else {
                    const result = {};
                    for (const key of request.session.controlArea) {
                        result[key] = findResult[key];
                    }
                    return public_1.responseAndTypeAuth(response, {
                        message: result,
                        stateCode: 200
                    });
                }
            }
        }).catch(error => {
            request.logger.error(error.stack);
            return public_1.code500(response);
        });
    }
];
const patternOfData = new RegExp(`^[\u2E80-\u2EFF\u2F00-\u2FDF\u3000-\u303F\u31C0-\u31EF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FBF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF\\w]{1,10}$`);
/**
 * 递归数据检测上传的专业模型是否符合规范
 * **注意**:一旦检测到错误会抛出异常
 * @param data 要被检测的数据
 */
const checkBody = (data) => {
    if (Array.isArray(data)) {
        // 检查数组中是否有重名的
        if (new Set(data).size === data.length) {
            for (const item of data) {
                // 检测所有的值是否通过了验证
                if (!patternOfData.test(item)) {
                    throw new Error(`The ${item} of element of Array unable to pass verify.`);
                }
            }
            return;
        }
        else {
            throw new Error("The element of array can't be repeat.");
        }
    }
    for (const key of Object.keys(data)) {
        // 键名要通过测试
        if (patternOfData.test(key)) {
            if (typeof data[key] === 'object') {
                checkBody(data[key]);
            }
            else {
                // 只能是Array和Object
                throw new Error(`The Object-value ${data[key]} type is not object or array`);
            }
        }
        else {
            throw new Error(`The Object-key ${key} unable to pass verify.`);
        }
    }
};
/**
 * POST 对应的中间件
 */
exports.MiddlewaresOfPost = [
    public_2.JSONParser,
    (error, request, response, next) => {
        // 记录错误栈
        request.logger.warn(`${code_1.SystemErrorCode['警告:数据校验错误']} Original data from user ${request.body}`);
        request.logger.error(error);
        return public_1.responseAndTypeAuth(response, {
            stateCode: 400,
            message: code_1.responseMessage['错误:数据校验错误']
        });
    }, (request, response, next) => {
        try {
            const SourceData = request.body, Database = globalData_1.globalDataInstance.getMongoDatabase();
            checkBody(SourceData);
            collectionUpdate_1.updateOfNoticeModelInModel(Database.collection(assets_1.CollectionName), SourceData).then(({ result }) => {
                if (result.ok) {
                    return collectionWrite_1.writeOfModel(Database.collection(exports.CollectionName), SourceData);
                }
                public_1.logger500(request.logger, SourceData, code_1.SystemErrorCode['错误:数据库回调异常']);
                public_1.code500(response);
            }).then((writeResult) => {
                if (writeResult.ok) {
                    public_1.code200(response);
                }
                else {
                    public_1.logger500(request.logger, SourceData, code_1.SystemErrorCode['错误:数据库回调异常']);
                    public_1.code500(response);
                }
            })
                .catch((error) => {
                public_1.logger500(request.logger, SourceData, code_1.SystemErrorCode['错误:数据库回调异常'], error);
                public_1.code500(response);
            });
        }
        catch (error) {
            // TODO 记录用户
            request.logger.error(error);
            return public_1.responseAndTypeAuth(response, {
                stateCode: 400,
                message: code_1.responseMessage['错误:数据校验错误']
            });
        }
    }
];
