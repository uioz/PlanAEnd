import { Request, Response, NextFunction, response } from "express";
import { Logger } from "log4js";

// TODO 拆分类型 一个有logger版本的一个没有logger版本的,基于session类型
// TODO filter使用api-check并且使用session类型

/**
 * 该接口描述了含有logger对象的express-response对象
 */
interface RequestHaveLogger extends Request {
    logger:Logger;
    session:{
        /**
         * 账户名称
         */
        account:string;
        /**
         * 权限数值
         */
        level:number;
        /**
         * 权限字符型
         */
        levelCodeRaw:string;
        // 以下的类型声明引用自express-session且类型兼容 see node_modules\@types\express-session\index.d.ts
        id: string;
        regenerate(callback: (err: any) => void): void;
        destroy(callback: (err: any) => void): void;
        reload(callback: (err: any) => void): void;
        save(callback: (err: any) => void): void;
        touch(callback: (err: any) => void): void;
        cookie:{
            serialize(name: string, value: string): string;
            originalMaxAge: number;
            path: string;
            maxAge: number | null;
            secure?: boolean;
            httpOnly: boolean;
            domain?: string;
            expires: Date | boolean;
            sameSite?: boolean | string;
        }
    }
}



/**
 * 该接口描述了Logger中间件适用于三个参数的普通中间件
 */
export interface Middleware {
    (request: RequestHaveLogger, response: Response, next: NextFunction):void
}

/**
 * 该接口描述了错误中间件的类型
 */
export interface ErrorMiddleware {
    (error: string, request: RequestHaveLogger, response: Response, next: NextFunction): void
}

/**
 * 该枚举定义了环境变量
 */
export enum NODE_ENV {
    'dev' = 'development',
    'pron' = 'pronduction'
}

/**
 * 声明了权限码的类型
 */
export type LeveCodeRawType = string;

/**
 * 声明了响应状态码的类型,规则和HTTP响应代码一致
 * > https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status
 */
export type stateCode = 200 | 400 | 403 | 404 | 500;

/**
 * 服务器基本响应类型
 */
export interface restrictResponse {
    message:any;
    stateCode:stateCode;
}