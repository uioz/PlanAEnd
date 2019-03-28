"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const public_1 = require("./public");
const collectionRead_1 = require("../model/collectionRead");
const code_1 = require("../code");
/**
 * 简介:
 * 管理后台的基本数据获取,获取服务器公告,以及名称和logo等静态内容.
 * 顶级URL为/api/server/base
 * 这个模块对外开放不需要任何添加filter
 */
exports.CollectionName = 'model_assets';
exports.addRoute = ({ LogMiddleware }, globalDataInstance) => {
    const router = express_1.Router(), collection = globalDataInstance.getMongoDatabase().collection(exports.CollectionName);
    router.get('/api/client/base', LogMiddleware, (request, response) => {
        collectionRead_1.readOfApiClientBase(collection).then((result) => {
            public_1.responseAndTypeAuth(response, {
                stateCode: 200,
                message: result
            });
        })
            .catch((error) => {
            public_1.logger500(request.logger, undefined, code_1.SystemErrorCode['错误:数据库回调异常'], error);
            public_1.code500(response);
        });
    });
    return router;
};
