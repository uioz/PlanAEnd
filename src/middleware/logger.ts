import { Middleware as Middleware } from "../types";
import { globalData } from "../globalData";

const Logger = globalData.getLogger();

/**
 * 日志中间件接口
 * @param request 
 * @param response 
 * @param next 
 */
export const LogMiddleware:Middleware = (request,response,next)=>{
    (request as any).logger = Logger;
    next();
}