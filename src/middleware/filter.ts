import { Request, Response, NextFunction } from "express";
import { ResponseErrorCode } from "../code";
import { LeveCodeRawType, NODE_ENV,Middleware } from "../types";

/**
 * 认证中间件,主要有两个功能
 * 1. 拦截session内容是空的请求
 * 2. 拦截权限不够的请求
 * 
 * 权限判断过程,传入的Index会进行分解例如'12'会被拆分成`1','2'进行遍历
 * 然后判断对应的
 * @param request 
 * @param response 
 * @param next 
 */
export const verifyMiddleware = (level: string) => (request: Request, response: Response, next: NextFunction) => {

    const session = request.session

    // TODO 添加测试分支
    if(process.env.NODE_ENV === NODE_ENV.dev){
        return next();
    }

    if (!request.session.userId) {
        return next(ResponseErrorCode['错误:非法请求']);
    }

    const levelCodeRaw: LeveCodeRawType = request.session.levelCode;
    // 管理员
    if (levelCodeRaw[0] === '0') {
        return next();
    }

    for (const index of level) {
        if (levelCodeRaw[index] === '0') {
            return next(ResponseErrorCode['错误:权限不足']);
        }
    }

    return next();

}

/**
 * 过滤客户端时间范围请求
 */
export const timeRange = () => {

}