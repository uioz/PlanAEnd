"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const code_1 = require("../code");
const collectionRead_1 = require("../model/collectionRead");
const globalData_1 = require("../globalData");
const apiCheck = require("api-check");
const public_1 = require("./public");
const collectionWrite_1 = require("../model/collectionWrite");
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
/**
 * 定义请求格式验证模板
 */
const postShape = apiCheck.shape({
    account: apiCheck.string,
    nickname: apiCheck.string.optional,
    level: apiCheck.range(1, 63).optional,
    password: apiCheck.string.optional,
    controlarea: apiCheck.arrayOf(apiCheck.string).optional
}).strict;
/**
 * 定义删除验证模板
 */
const deleteShape = apiCheck.shape({
    account: apiCheck.string
}).strict;
/**
 * GET 对应的中间件
 */
exports.MiddlewareOfGet = [(request, response, next) => {
        const collection = globalData_1.globalDataInstance.getMongoDatabase().collection(exports.CollectionName);
        collectionRead_1.readUserList(collection).then(list => public_1.responseAndTypeAuth(response, {
            stateCode: 200,
            message: list
        }))
            .catch(error => {
            request.logger.error(code_1.SystemErrorCode['错误:数据库读取错误']);
            request.logger.error(error);
            return public_1.code500(response);
        });
    }];
/**
 * POST 对应的中间件
 */
exports.MiddlewareOfPost = [public_1.JSONParser, (request, response) => {
        const result = postShape(request.body);
        if (result instanceof Error) {
            // TODO 记录用户
            public_1.logger400(request.logger, request.body, undefined, result);
            return public_1.code400(response);
        }
    }, (request, response) => {
        const dataOfRequest = request.body;
        // SHA1加密后的密钥长度为40位
        if (dataOfRequest.password) {
            if (dataOfRequest.password.length !== 40) {
                public_1.logger400(request.logger, dataOfRequest, code_1.SystemErrorCode['错误:密钥验证错误']);
                return public_1.code400(response);
            }
        }
        const collection = globalData_1.globalDataInstance.getMongoDatabase().collection(exports.CollectionName);
        collectionWrite_1.writeOfUser(collection, dataOfRequest).then(writeReaponse => {
            if (writeReaponse.result.ok) {
                return public_1.code200(response);
            }
            else {
                request.logger.error(code_1.SystemErrorCode['错误:数据库写入失败']);
                return public_1.code500(response);
            }
        })
            .catch(error => {
            request.logger.error(code_1.SystemErrorCode['错误:数据库写入失败']);
            request.logger.error(error);
            return public_1.code500(response);
        });
    }];
/**
 * Delete 对应的中间件
 */
exports.MiddlewareOfDelete = [(request, response, next) => {
        const DataOfRequest = request.body, result = deleteShape(DataOfRequest);
        // TODO 等待编写
        if (result instanceof Error) {
            public_1.logger400(request.logger, DataOfRequest, undefined, result);
            return public_1.code400(response);
        }
    }, (request, response, next) => {
        response.end('ok');
    }];
