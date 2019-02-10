import { ErrorMiddleware } from "../types";
import { NODE_ENV } from "../types";
import { GlobalData } from "../globalData";
import { Logger } from "log4js";

const RunningInDev = process.env.NODE_ENV === NODE_ENV.dev;

// 延迟加载,防止Node预见解析内容,而logger实例中此时没有对应的数据
let logger:Logger;
process.nextTick(()=>{
    logger = ((global as any).globalData as GlobalData).getLogger();
})

/**
 * 错误记录中间件 TODO 废弃
 * @param error 
 * @param request 
 * @param response 
 * @param next 
 */
export const SetLogMiddleware: ErrorMiddleware = (error, request, response, next) => {

    (request as any).logger = logger;
    next(error);

}

/**
 * 全局最终处理中间件
 * @param error 
 * @param request 
 * @param response 
 * @param next 
 */
export const FinalErrorMiddleware: ErrorMiddleware = (error, request, response, next) => {

    // TODO 等待编写
    if (RunningInDev) {
        response.end(error);
    }

}
