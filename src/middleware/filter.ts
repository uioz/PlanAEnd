import { Response, NextFunction } from "express";
import { ResponseErrorCode } from "../code";
import { LeveCodeRawType, NODE_ENV,RequestHaveSession,ParsedSession } from "../types";
import { globalDataInstance } from "../globalData";
import { Privilege } from "../utils/privilege";
import { setInfoToSession } from "../utils/sessionHelper";


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
export const verifyMiddleware = (level: string) => (request: RequestHaveSession, response: Response, next: NextFunction) => {

    const session = request.session

    // TODO 添加测试分支
    if(process.env.NODE_ENV === NODE_ENV.dev){
        // 没有挂载userId
        setInfoToSession(request,{
            account: globalDataInstance.getSuperUserAccount(),
            controlArea:[],
            level:0,
            levelCodeRaw:'0000000' 
        } as any);
        return next();
    }

    // illegal access
    if(!request.session.userId){
        return next(ResponseErrorCode['错误:非法请求']);
    }

    const levelCodeRaw: LeveCodeRawType = session.levelCodeRaw;

    if (Privilege.auth(level, levelCodeRaw)){
        return next();
    }else{
        return next(ResponseErrorCode['错误:权限不足']);
    }

}

/**
 * 过滤客户端时间范围请求
 */
export const timeRange = () => {

}