"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const public_1 = require("./public");
const code_1 = require("../code");
/**
 * 简介:
 * 该模块用于管理员登出
 * 顶级URL为/logout
 * 本模块导出的是模块化路由
 * 该路由下只允许GET请求
 */
/**
 * 本模块使用的集合名称
 */
exports.CollectionName = 'model_users';
/**
 * GET对应的权限下标(不需要权限)
 */
exports.LevelIndexOfGet = '';
exports.addRoute = ({ LogMiddleware, SessionMiddleware, verifyMiddleware }) => {
    const router = express_1.Router();
    router.get('/logout', SessionMiddleware, verifyMiddleware(exports.LevelIndexOfGet), LogMiddleware, (request, response, next) => {
        request.session.destroy((error) => {
            if (error) {
                public_1.logger500(request.logger, undefined, code_1.SystemErrorCode['错误:session移出失败']);
                public_1.code500(response);
            }
            else {
                public_1.code200(response, code_1.responseMessage['登出成功']);
            }
        });
    });
    return router;
};
