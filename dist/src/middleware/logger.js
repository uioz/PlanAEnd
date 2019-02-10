"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globalData_1 = require("../globalData");
const Logger = globalData_1.globalData.getLogger();
/**
 * 日志中间件接口
 * @param request
 * @param response
 * @param next
 */
exports.LogMiddleware = (request, response, next) => {
    request.logger = Logger;
    next();
};
