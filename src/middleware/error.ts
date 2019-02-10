import { ErrorMiddleware } from "../types";
import { Logger } from "log4js";
import { NODE_ENV } from "../types";

const RunningInDev = process.env.NODE_ENV === NODE_ENV.dev;

/**
 * 错误记录中间件
 * @param error 
 * @param request 
 * @param response 
 * @param next 
 */
export const ErrorMiddlewareLogger: ErrorMiddleware = (error, request, response, next) => {

    ((request as any).logger as Logger).error(error);
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
