"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const code_1 = require("../code");
const globalData_1 = require("../globalData");
const collectionRead_1 = require("../model/collectionRead");
const bodyParser = require("body-parser");
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
exports.DatabaseName = 'model_speciality';
/**
 * GET 对应的中间件
 */
exports.MiddlewaresOfGet = [
    (request, response, next) => {
        // 此时通过的请求都是经过session验证的请求
        // 此时挂载了logger 和 express-session 中间件
        const collection = globalData_1.globalDataInstance.getMongoDatabase().collection(exports.DatabaseName);
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
/**
 * POST 对应的中间件
 */
exports.MiddlewaresOfPost = [
    JSONParser,
    (error, request, response, next) => {
        // 记录错误栈
        request.logger.error(error);
        return next(code_1.ResponseErrorCode['错误:数据校验错误']);
    }, (request, response, next) => {
        response.end('ok');
    }
];
