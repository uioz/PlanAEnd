import { Middleware as Middleware } from "../types";
import { Logger } from "log4js";
import { globalDataInstance } from "../globalData";
let logger:Logger;
globalDataInstance.getLoggerPro().then(result=>logger=result)


/**
 * 日志中间件接口
 * @param request 
 * @param response 
 * @param next 
 */
export const LogMiddleware:Middleware = (request,response,next)=>{
    (request as any).logger = logger;
    next();
}