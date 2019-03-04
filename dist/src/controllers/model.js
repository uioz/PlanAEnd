"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const code_1 = require("../code");
const globalData_1 = require("../globalData");
const collectionRead_1 = require("../model/collectionRead");
const bodyParser = require("body-parser");
const collectionWrite_1 = require("../model/collectionWrite");
/**
 * 使用body-paser定义JSON解析中间件
 */
const JSONParser = bodyParser.json({
    inflate: true,
    limit: '100kb',
    strict: true,
    type: 'application/json',
});
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
 * GET 对应的权限下标(不需要权限)
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
        collectionRead_1.collectionReadAllIfHave(collection)
            .then(result => {
            if (result) {
                return response.json({
                    message: result,
                    stateCode: 200
                });
            }
            else {
                return response.json({
                    message: code_1.responseMessage['错误:暂无数据'],
                    stateCode: 400
                });
            }
        })
            .catch(error => {
            request.logger.error(error.stack);
            return response.json({
                stateCode: 500,
                message: code_1.responseMessage['错误:服务器错误']
            });
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
        for (const item of data) {
            if (!patternOfData.test(item)) {
                throw new Error(`The ${item} of element of Array unable to pass verify.`);
            }
        }
        return;
    }
    for (const key of Object.keys(data)) {
        if (patternOfData.test(key)) {
            if (typeof data[key] === 'object') {
                checkBody(data[key]);
            }
            else {
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
    JSONParser,
    (error, request, response, next) => {
        // 记录错误栈
        request.logger.error(error);
        return next(code_1.responseMessage['错误:数据校验错误']);
    }, (request, response, next) => {
        try {
            const SourceData = request.body;
            checkBody(SourceData);
            collectionWrite_1.writeOfModel(globalData_1.globalDataInstance.getMongoDatabase().collection(exports.CollectionName), SourceData)
                .then(result => {
                if (!result.ok) {
                    request.logger.warn(`${code_1.SystemErrorCode['错误:数据库回调异常']} ${result}`);
                }
            })
                .catch(error => {
                request.logger.error(error);
                request.logger.error(code_1.SystemErrorCode['错误:数据库写入失败']);
            });
            response.json({
                stateCode: 200,
                message: code_1.responseMessage['数据上传成功']
            });
        }
        catch (error) {
            // TODO 记录用户
            request.logger.error(error);
            response.json({
                stateCode: 400,
                message: code_1.responseMessage['错误:数据校验错误']
            });
        }
        // TODO 编写 模型正则过滤,长度过滤,底部数组过滤
        response.end('ok');
    }
];
