"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 文件不存在中间件
 * 需要注意的是该中间件依赖Log中间件
 * @param request
 * @param response
 */
exports.NotFoundMiddleware = (request, response) => {
    request.logger.warn(`404 Not Found in ${request.url}`);
    response.end('404 Not Found');
};
