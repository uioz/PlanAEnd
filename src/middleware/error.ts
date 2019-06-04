import { ErrorMiddleware } from "../types";
import { NODE_ENV } from "../types";
import { Logger } from "log4js";
import { ResponseErrorCode } from "../code";

const RunningInDev = process.env.NODE_ENV === NODE_ENV.dev;


/**
 * 错误记录中间件
 * @param error 
 * @param request 
 * @param response 
 * @param next 
 */
export const SetLogMiddleware = (logger:Logger)=>(error, request, response, next) => {

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

    error = typeof error === 'number' ? ResponseErrorCode[error] : error;

    (request as any).logger.error(error);
    if (RunningInDev) {
        response.end(error);
    }else{
        response.destroy();
    }

}