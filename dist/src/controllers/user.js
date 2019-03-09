"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const code_1 = require("../code");
const collectionRead_1 = require("../model/collectionRead");
const globalData_1 = require("../globalData");
const apiCheck = require("api-check");
/**
 * 简介:
 * 该模块负责用户信息的获取 GET
 * 该模块负责用户的添加 POST
 * 该模块负责用户的删除 DELETE
 * URL:
 * /user
 */
/**
 * 本模块对应的URL地址
 */
exports.URL = '/user';
/**
 * GET 对应的权限下标
 */
exports.LevelIndexOfGet = code_1.LevelCode.ManagementIndex.toString();
/**
 * POST 对应的权限下标
 */
exports.LevelIndexOfPost = code_1.LevelCode.ManagementIndex.toString();
/**
 * DELETE 对应的权限下标
 */
exports.LevelIndexOfDelete = code_1.LevelCode.ManagementIndex.toString();
/**
 * 本模块对应的集合名称
 */
exports.CollectionName = 'model_users';
const postShape = apiCheck.shape({
    account: apiCheck.string,
    nickname: apiCheck.string,
    level: apiCheck.number,
    levelcoderaw: apiCheck.string,
    password: apiCheck.string,
    controlarea: apiCheck.arrayOf(apiCheck.number)
});
/**
 * GET 对应的中间件
 */
exports.MiddlewareOfGet = [(request, response, next) => {
        const collection = globalData_1.globalDataInstance.getMongoDatabase().collection(exports.CollectionName);
        collectionRead_1.readUserList(collection).then(list => response.json({
            stateCode: 200,
            message: list
        }))
            .catch(error => {
            response.json({
                stateCode: 500,
                message: code_1.responseMessage['错误:服务器错误']
            });
            request.logger.error(code_1.SystemErrorCode['错误:数据库读取错误']);
            request.logger.error(error);
        });
    }];
/**
 * POST 对应的中间件
 */
exports.MiddlewareOfPost = [(request, response, next) => {
        response.end('ok');
    }];
/**
 * Delete 对应的中间件
 */
exports.MiddlewareOfDelete = [(request, response, next) => {
        response.end('ok');
    }];
