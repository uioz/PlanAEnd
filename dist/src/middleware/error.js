"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
const RunningInDev = process.env.NODE_ENV === types_1.NODE_ENV.dev;
/**
 * 错误记录中间件
 * @param error
 * @param request
 * @param response
 * @param next
 */
exports.LogErrorMiddleware = (error, request, response, next) => {
    request.logger.error(error);
    next(error);
};
/**
 * 全局最终处理中间件
 * @param error
 * @param request
 * @param response
 * @param next
 */
exports.FinalErrorMiddleware = (error, request, response, next) => {
    // TODO 等待编写
    if (RunningInDev) {
        response.end(error);
    }
};
