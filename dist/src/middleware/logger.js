"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globalData_1 = require("../globalData");
let logger;
globalData_1.globalDataInstance.getLoggerPro().then(result => logger = result);
/**
 * 日志中间件接口
 * @param request
 * @param response
 * @param next
 */
exports.LogMiddleware = (request, response, next) => {
    request.logger = logger;
    next();
};
