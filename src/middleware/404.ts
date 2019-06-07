import { Middleware } from "../types";

/**
 * 文件不存在中间件
 * 需要注意的是该中间件依赖Log中间件
 * @param request 
 * @param response 
 */
export const NotFoundMiddleware:Middleware = (request,response)=>{
    (request as any).logger.warn(`404 Not Found in ${request.url}`);
    response.status(404);
    response.end('404 Not Found');
};

