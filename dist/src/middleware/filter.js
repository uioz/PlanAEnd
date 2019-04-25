"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const code_1 = require("../code");
const types_1 = require("../types");
const apiCheck = require("api-check");
const globalData_1 = require("../globalData");
const AuthShape = apiCheck.shape({
    account: apiCheck.string,
    level: apiCheck.number,
    levelCodeRaw: apiCheck.number,
    userId: apiCheck.object
});
/**
 * 认证中间件,主要有两个功能
 * 1. 拦截session内容是空的请求
 * 2. 拦截权限不够的请求
 *
 * 权限判断过程,传入的Index会进行分解例如'12'会被拆分成`1','2'进行遍历
 * 然后判断对应的
 * @param request
 * @param response
 * @param next
 */
exports.verifyMiddleware = (level) => (request, response, next) => {
    const session = request.session;
    // TODO 添加测试分支
    if (process.env.NODE_ENV === types_1.NODE_ENV.dev) {
        request.session.account = globalData_1.globalDataInstance.getSuperUserAccount();
        return next();
    }
    const AuthResult = AuthShape(session);
    if (AuthResult instanceof Error) {
        return next(AuthResult);
    }
    const levelCodeRaw = session.levelCodeRaw;
    // 管理员
    if (levelCodeRaw[0] === '0') {
        return next();
    }
    for (const index of level) {
        if (levelCodeRaw[index] === '0') {
            return next(code_1.ResponseErrorCode['错误:权限不足']);
        }
    }
    return next();
};
/**
 * 过滤客户端时间范围请求
 */
exports.timeRange = () => {
};
