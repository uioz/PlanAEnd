"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const code_1 = require("../code");
const collectionRead_1 = require("../model/collectionRead");
const globalData_1 = require("../globalData");
const apiCheck = require("api-check");
const public_1 = require("./public");
const collectionUpdate_1 = require("../model/collectionUpdate");
const collectionDelete_1 = require("../model/collectionDelete");
/**
 * 简介:
 * 该模块负责用户信息的获取 GET
 * 该模块负责用户信息的更新 POST
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
            public_1.logger500(request.logger, undefined, undefined, error);
            return public_1.code500(response);
        });
    }];
/**
 * POST 对应的中间件
 */
exports.MiddlewareOfPost = [public_1.JSONParser, (request, response, next) => {
        const result = postShape(request.body);
        if (result instanceof Error) {
            // TODO 记录用户
            public_1.logger400(request.logger, request.body, undefined, result);
            return public_1.code400(response);
        }
        return next();
    }, (request, response) => {
        const dataOfRequest = request.body;
        // 如果更新密码 - SHA1加密后的密钥长度为40位
        if (dataOfRequest.password) {
            if (dataOfRequest.password.length !== 40) {
                public_1.logger400(request.logger, dataOfRequest, code_1.SystemErrorCode['错误:密钥验证错误']);
                return public_1.code400(response);
            }
        }
        // 如果添加了level字段则向数据库中提供一个对应的levelcoderaw
        if (dataOfRequest.level) {
            dataOfRequest.levelcoderaw = "0" + (dataOfRequest.level).toString(2);
        }
        const collection = globalData_1.globalDataInstance.getMongoDatabase().collection(exports.CollectionName);
        collectionUpdate_1.updateOfUser(collection, dataOfRequest).then(writeReaponse => {
            if (writeReaponse.result.ok) {
                const sessionCollection = globalData_1.globalDataInstance.getMongoDatabase().collection('sessionCollectionName');
                collectionDelete_1.deleteSessionByAccount(sessionCollection, dataOfRequest.account).catch(error => public_1.logger500(request.logger, dataOfRequest, undefined, error));
                // 如果更新的账户是自己则清空session后跳转到登陆页
                if (dataOfRequest.account === request.session.account) {
                    return response.redirect('/login');
                }
                else {
                    return public_1.code200(response);
                }
            }
            else {
                public_1.logger500(request.logger, dataOfRequest, code_1.SystemErrorCode['错误:数据库写入失败'], writeReaponse);
                return public_1.code500(response);
            }
        })
            .catch(error => {
            public_1.logger500(request.logger, dataOfRequest, code_1.SystemErrorCode['错误:数据库写入失败'], error);
            return public_1.code500(response);
        });
    }];
/**
 * Delete 对应的中间件
 */
exports.MiddlewareOfDelete = [(request, response, next) => {
        const SuperUserAccount = globalData_1.globalDataInstance.getSuperUserAccount(), dataOfRequest = request.query, result = deleteShape(dataOfRequest), Collection = globalData_1.globalDataInstance.getMongoDatabase().collection(exports.CollectionName);
        // 是否格式错误
        if (result) {
            public_1.logger400(request.logger, dataOfRequest, undefined, result);
            return public_1.code400(response);
        }
        // 不可以删除超级管理员
        if (dataOfRequest.account === SuperUserAccount) {
            public_1.logger400(request.logger, dataOfRequest, code_1.SystemErrorCode['错误:尝试修改超级管理员']);
            return public_1.code400(response);
        }
        collectionDelete_1.deleteOfUser(Collection, dataOfRequest.account).then(result => {
            if (result.deletedCount) {
                const sessionCollection = globalData_1.globalDataInstance.getMongoDatabase().collection('sessionCollectionName');
                collectionDelete_1.deleteSessionByAccount(sessionCollection, dataOfRequest.account).catch(error => public_1.logger500(request.logger, dataOfRequest, undefined, error));
                // 如果删除的是自己则清空session并且重定向到登陆页
                if (dataOfRequest.account === request.session.account) {
                    return response.redirect('/login');
                }
                else {
                    return public_1.code200(response);
                }
            }
            else {
                return public_1.responseAndTypeAuth(response, {
                    stateCode: 400,
                    message: code_1.responseMessage['错误:指定的数据不存在']
                });
            }
        })
            .catch(error => {
            public_1.logger500(request.logger, dataOfRequest, undefined, error);
            return public_1.code500(response);
        });
    }];
