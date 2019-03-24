"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const apiCheck = require("api-check");
const public_1 = require("./public");
const code_1 = require("../code");
/**
 * 简介:
 * 该模块服务器管理员登陆
 * 顶级URL为/login
 * 本模块导出的是模块化路由
 * 该路由下有多个路径
 */
/**
 * 本模块使用的集合名称
 */
exports.CollectionName = 'model_users';
/**
 * login
 */
const postLoginShape = apiCheck.shape({
    account: apiCheck.string,
    password: apiCheck.string
}).strict;
exports.addRoute = ({ LogMiddleware, SessionMiddleware, verifyMiddleware }, globalDataInstance) => {
    const router = express_1.Router(), collection = globalDataInstance.getMongoDatabase().collection(exports.CollectionName);
    router.post('/login', public_1.JSONParser, SessionMiddleware, LogMiddleware, (request, response, next) => {
        // 拦截已经登陆的用户
        if (request.session.userid ||
            request.session.level ||
            request.session.levelCodeRaw) {
            return public_1.code500(response);
        }
        next();
    }, (request, response) => {
        const requestBody = request.body, checkResult = postLoginShape(requestBody);
        if (checkResult instanceof Error) {
            public_1.logger400(request.logger, requestBody, undefined, checkResult);
            return public_1.code400(response);
        }
        collection.findOne({
            account: requestBody.account
        }).then((result) => {
            if (!result) {
                return public_1.code400(response, code_1.responseMessage['错误:用户不存在']);
            }
            if (result.password !== requestBody.password) {
                return public_1.code400(response, code_1.responseMessage['错误:帐号或者密码错误']);
            }
            const session = request.session;
            session.userid = result.account;
            session.level = result.level;
            session.levelCodeRaw = result.levelcoderaw;
            return public_1.responseAndTypeAuth(response, {
                stateCode: 200,
                message: code_1.responseMessage['登陆成功'],
                data: {
                    nickName: result.nickName,
                    level: result.level,
                    levelCodeRaw: result.levelcoderaw,
                    controlArea: result.controlarea
                }
            });
        }).catch((error) => {
            public_1.logger500(request.logger, requestBody, code_1.SystemErrorCode['错误:数据库读取错误'], error);
            public_1.code400(response);
        });
    });
    return router;
};
