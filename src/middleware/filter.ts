import { Request,Response,NextFunction } from "express";
import { FilterCode } from "../code";


/**
 * 认证中间件,主要有两个功能
 * 1. 拦截session内容是空的请求
 * 2. 拦截权限不够的请求
 * @param request 
 * @param response 
 * @param next 
 */
export const verifyMiddleware = (level:number)=>(request:Request,response:Response,next:NextFunction)=>{

    if(!request.session.userId){
        return next(FilterCode['错误:非法请求']);
    }

    if(request.session.level !== level){
        return next(FilterCode['错误:权限不足']);
    }

    next();

}

/**
 * 过滤客户端时间范围请求
 */
export const timeRange = ()=>{

}