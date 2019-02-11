"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const code_1 = require("../code");
/**
 * 认证中间件,主要有两个功能
 * 1. 拦截session内容是空的请求
 * 2. 拦截权限不够的请求
 * @param request
 * @param response
 * @param next
 */
exports.verifyMiddleware = (level) => (request, response, next) => {
    if (!request.session.userId) {
        return next(code_1.FilterCode['错误:非法请求']);
    }
    if (request.session.level !== level) {
        return next(code_1.FilterCode['错误:权限不足']);
    }
    next();
};
/**
 * 过滤客户端时间范围请求
 */
exports.timeRange = () => {
};
