import { Response, NextFunction } from "express";
import { ResponseErrorCode } from "../code";
import { NODE_ENV, RequestHaveSession } from "../types";
import { globalDataInstance } from "../globalData";
import { Privilege } from "../utils/privilege";
import { setInfoToSession } from "../helper/session";
import { GetUserI } from "../helper/user";


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
        // setInfoToSession(request, {
        //     userid: globalDataInstance.getSuperUserId(),
        //     superUser: true
        // });
        // TODO 写入一个普通用户 userid 是运行时数据库生成的id
        // TODO 测试 source.json
        setInfoToSession(request, {
            userid: "5cf875d53206cb1df4962436",
        });
        return next();
    }

    // illegal access
    if (!request.session.userid) {
        return next(ResponseErrorCode['错误:非法请求']);
    }

    // 在此之前的初始化中已经提供了 collection
    GetUserI().getInfo(request.session.userid).then(result => {

        if (Privilege.auth(level, result.levelcoderaw)) {
            return next();
        } else {
            return next(ResponseErrorCode['错误:权限不足']);
        }

    }).catch(next);

}
