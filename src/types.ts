import { Request, Response, NextFunction, response } from "express";
import { Logger } from "log4js";

/**
 * 该接口描述了基于Express-Session挂载的Session对象
 * 类型声明引用自express-session且类型兼容 see node_modules\@types\express-session\index.d.ts
 */
export interface Session {
    id: string;
    regenerate(callback: (err: any) => void): void;
    destroy(callback: (err: any) => void): void;
    reload(callback: (err: any) => void): void;
    save(callback: (err: any) => void): void;
    touch(callback: (err: any) => void): void;
    cookie: {
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

export interface ParsedSession{
    /**
     * 账户名称
     */
    account: string;
    /**
     * 权限数值
     */
    level: number;
    /**
     * 权限字符型
     */
    levelCodeRaw: string;
}

/**
 * 该接口描述了含有自定义Session的Request对象
 */
export interface RequestHaveSession extends Request {
    session: ParsedSession & Session;
}

/**
 * 该接口描述了含有Logger的Request对象
 */
export interface RequestHaveAuth extends RequestHaveSession {
    logger: Logger;
}

/**
 * 该接口描述了Logger中间件适用于三个参数的普通中间件
 */
export interface Middleware {
    (request: RequestHaveAuth, response: Response, next: NextFunction): void
}

/**
 * 该接口描述了错误中间件的类型
 */
export interface ErrorMiddleware {
    (error: string, request: RequestHaveAuth, response: Response, next: NextFunction): void
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
    message: any;
    stateCode: stateCode;
}