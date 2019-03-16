"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const public_1 = require("./public");
const code_1 = require("../code");
/**
 * 简介:
 * 该模块负责静态资源的管理
 * 包含了
 * - 专业消息管理
 * - 静态图片管理
 * - 应用程序名称
 * - 全局公告
 * 顶级URL为/assets
 * 本模块导出的是模块化路由.
 * 该模块下有多个路径
 */
/**
 * 本模块使用的集合名称
 */
exports.CollectionName = 'model_assets';
exports.addRoute = ({ LogMiddleware, SessionMiddleware, verifyMiddleware }, globalDataInstance) => {
    const router = express_1.Router(), collection = globalDataInstance.getMongoDatabase().collection(exports.CollectionName);
    router.get('/assets/speciality', LogMiddleware, SessionMiddleware, (request, response, next) => {
        public_1.autoReadOne(collection, response, request.logger).then(({ speciality }) => {
            public_1.responseAndTypeAuth(response, {
                stateCode: 200,
                message: speciality
            });
        });
    });
    router.get('/assets/:type/:key', LogMiddleware, SessionMiddleware, (request, response, next) => {
        const { type, key } = request.params;
        public_1.autoReadOne(collection, response, request.logger).then(result => {
            try {
                public_1.responseAndTypeAuth(response, {
                    stateCode: 200,
                    message: result[type][key]
                });
            }
            catch (error) {
                public_1.code500(response);
                public_1.logger500(request.logger, request.params, code_1.SystemErrorCode['错误:匹配数据库数据失败']);
            }
        });
    });
    return router;
};
