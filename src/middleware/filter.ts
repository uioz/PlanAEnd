import { Request, Response, NextFunction } from "express";
import { FilterCode } from "../code";
import { LeveCodeRawType } from "../types";

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

    if (!request.session.userId) {
        return next(FilterCode['错误:非法请求']);
    }

    const levelCodeRaw: LeveCodeRawType = request.session.levelCode;
    // 管理员
    if (levelCodeRaw[0] === '0') {
        next();
    }

    for (const index of level) {
        if (levelCodeRaw[index] === '0') {
            return next(FilterCode['错误:权限不足']);
        }
    }

    next();

}

/**
 * 过滤客户端时间范围请求
 */
export const timeRange = () => {

}