"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const apiCheck = require("api-check");
const public_1 = require("./public");
const code_1 = require("../code");
/**
 * 简介:
 * 该模块用于服务器管理员登陆
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
    const router = express_1.Router(), Database = globalDataInstance.getMongoDatabase(), collection = Database.collection(exports.CollectionName);
    router.post('/login', public_1.JSONParser, SessionMiddleware, LogMiddleware, (request, response, next) => {
        // TODO 会存在有session后获取用户信息的情况,所以去掉这个拦截
        // 登录不能使用认证中间件,所以这里
        // 需要手动拦截已经登陆的用户
        if (request.session.userid ||
            request.session.level ||
            request.session.levelCodeRaw) {
            return public_1.code500(response, code_1.responseMessage['错误:重复登录']);
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
            session.account = result.account;
            session.userid = result._id;
            session.level = result.level;
            session.levelCodeRaw = result.levelcoderaw;
            session.controlArea = result.controlarea;
            // 写入最后登录时间
            collection.updateOne({
                account: result.account
            }, {
                $set: {
                    lastlogintime: new Date
                }
            }).catch((error) => {
                public_1.logger500(request.logger, requestBody, code_1.SystemErrorCode['错误:数据库回调异常'], error);
            });
            return public_1.responseAndTypeAuth(response, {
                stateCode: 200,
                message: code_1.responseMessage['登陆成功'],
                data: {
                    nickName: result.nickname,
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
