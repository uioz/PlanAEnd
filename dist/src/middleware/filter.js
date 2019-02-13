"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const code_1 = require("../code");
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
    if (!request.session.userId) {
        return next(code_1.FilterCode['错误:非法请求']);
    }
    const levelCodeRaw = request.session.levelCode;
    // 管理员
    if (levelCodeRaw[0] === '0') {
        next();
    }
    for (const index of level) {
        if (levelCodeRaw[index] === '0') {
            return next(code_1.FilterCode['错误:权限不足']);
        }
    }
    next();
};
/**
 * 过滤客户端时间范围请求
 */
exports.timeRange = () => {
};
