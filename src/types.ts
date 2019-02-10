import { Request, Response, NextFunction } from "express";

/**
 * 该接口描述了Logger中间件适用于三个参数的普通中间件
 */
export interface Middleware {
    (request: Request, response: Response, next: NextFunction):void
}

/**
 * 该接口描述了错误中间件的类型
 */
export interface ErrorMiddleware {
    (error:string,request: Request, response: Response, next: NextFunction): void
}

/**
 * 该枚举定义了环境变量
 */
export enum NODE_ENV {
    'dev' = 'development',
    'pron' = 'pronduction'
}