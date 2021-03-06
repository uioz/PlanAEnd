import { Response, NextFunction } from "express";
import { ResponseErrorCode, responseMessage } from "../code";
import { NODE_ENV, RequestHaveSession } from "../types";
import { globalDataInstance } from "../globalData";
import { Privilege } from "../utils/privilege";
import { setInfoToSession } from "../helper/session";
import { GetUserI } from "../helper/user";
import { code400 } from "../controllers/public";


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

    // 当运行模式是开发环境的情况下, 设置为管理员账号
    if (process.env.NODE_ENV === NODE_ENV.dev) {
        setInfoToSession(request, {
            userid: globalDataInstance.getSuperUserId(),
            superUser: true
        });
        return next();
    }

    // illegal access
    if (!request.session.userid) {
        return code400(response,responseMessage['拒绝访问']);
    }

    // 在此之前的初始化中已经提供了 collection
    GetUserI().getInfo(request.session.userid).then(result => {

        if (Privilege.auth(level, result.levelcoderaw)) {
            return next();
        } else {
            return code400(response,responseMessage['错误:权限不足']);
        }

    }).catch(next);

}
