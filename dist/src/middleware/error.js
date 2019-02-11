"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
const globalData_1 = require("../globalData");
const RunningInDev = process.env.NODE_ENV === types_1.NODE_ENV.dev;
// 延迟加载,防止Node预见解析内容,而logger实例中此时没有对应的数据
let logger;
globalData_1.globalDataInstance.getLoggerPro().then(result => logger = result);
/**
 * 错误记录中间件 TODO 废弃
 * @param error
 * @param request
 * @param response
 * @param next
 */
exports.SetLogMiddleware = (error, request, response, next) => {
    request.logger = logger;
    // 将错误信息转为字符串进行传递
    let stack = '';
    if (typeof error === 'object') {
        stack = error.stack;
    }
    next(stack || error);
};
/**
 * 全局最终处理中间件
 * @param error
 * @param request
 * @param response
 * @param next
 */
exports.FinalErrorMiddleware = (error, request, response, next) => {
    request.logger.error(error);
    if (RunningInDev) {
        response.end(error);
    }
};
