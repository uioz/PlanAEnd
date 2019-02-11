import { ErrorMiddleware } from "../types";
import { NODE_ENV } from "../types";
import { globalDataInstance } from "../globalData";
import { Logger } from "log4js";

const RunningInDev = process.env.NODE_ENV === NODE_ENV.dev;

// 延迟加载,防止Node预见解析内容,而logger实例中此时没有对应的数据
let logger:Logger;
globalDataInstance.getLoggerPro().then(result=>logger=result)

/**
 * 错误记录中间件 TODO 废弃
 * @param error 
 * @param request 
 * @param response 
 * @param next 
 */
export const SetLogMiddleware: ErrorMiddleware = (error, request, response, next) => {

    (request as any).logger = logger;
    // 将错误信息转为字符串进行传递
    let stack = '';
    if(typeof error === 'object'){
        stack = (error as Error).stack;
    }
    next(stack || error);

}

/**
 * 全局最终处理中间件
 * @param error 
 * @param request 
 * @param response 
 * @param next 
 */
export const FinalErrorMiddleware: ErrorMiddleware = (error, request, response, next) => {

    (request as any).logger.error(error);
    if (RunningInDev) {
        response.end(error);
    }else{
        response.destroy();
    }

}
