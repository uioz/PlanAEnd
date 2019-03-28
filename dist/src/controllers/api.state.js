"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const collectionRead_1 = require("../model/collectionRead");
const public_1 = require("./public");
const code_1 = require("../code");
/**
 * 简介:
 * 管理员登录后的欢迎页面的初始数据提供.
 * 提供一些服务器的基本信息.
 * 顶级URL为/api/state
 */
/**
 * 本模块使用的集合名称
 */
exports.CollectionNames = ['configuration_static', 'model_users'];
/**
 * GET对应的权限下标(不需要权限)
 */
exports.LevelIndexOfGet = '';
exports.addRoute = ({ LogMiddleware, SessionMiddleware, verifyMiddleware }, globalDataInstance) => {
    const router = express_1.Router(), CollectionOfConfig = globalDataInstance.getMongoDatabase().collection(exports.CollectionNames[0]), CollectionOfUsers = globalDataInstance.getMongoDatabase().collection(exports.CollectionNames[1]);
    router.get('/api/state', SessionMiddleware, verifyMiddleware(exports.LevelIndexOfGet), LogMiddleware, (request, response) => {
        const account = request.session.account;
        collectionRead_1.readOfApiState(CollectionOfConfig, CollectionOfUsers, request.session.account).then((responseBody) => {
            public_1.responseAndTypeAuth(response, {
                stateCode: 200,
                message: responseBody
            });
        }).catch((error) => {
            public_1.logger500(request.logger, undefined, code_1.SystemErrorCode['错误:数据库回调异常'], error);
            public_1.code500(response);
        });
    });
    return router;
};
