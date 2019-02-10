"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
const RunningInDev = process.env.NODE_ENV === types_1.NODE_ENV.dev;
// 延迟加载,防止Node预见解析内容,而logger实例中此时没有对应的数据
let logger;
process.nextTick(() => {
    logger = global.globalData.getLogger();
});
/**
 * 错误记录中间件 TODO 废弃
 * @param error
 * @param request
 * @param response
 * @param next
 */
exports.SetLogMiddleware = (error, request, response, next) => {
    request.logger = logger;
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
