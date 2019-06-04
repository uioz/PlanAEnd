import { Middleware as Middleware } from "../types";
import { Logger } from "log4js";

/**
 * 日志中间件接口
 * @param request 
 * @param response 
 * @param next 
 */
export const LogMiddleware = (logger: Logger) => (request,response,next): Middleware=>{
    request.logger = logger;
    return next();
}
