import { Request, Response, NextFunction, response, Router } from "express";
import { Logger } from "log4js";
import { verifyMiddleware } from "../src/middleware/filter";
import { GlobalData } from "./globalData";

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

export interface ParsedSession {
    /**
     * 用户唯一id
     */
    userid?: string;
    /**
     * 权限数值
     */
    level?: number;
    /**
     * 权限字符型
     */
    levelcoderaw?: string;
    /**
     * 账户名称
     */
    account?: string;
    /**
     * 管理范围
     */
    controlarea?: Array<string>;
    /**
     * 密码
     */
    password?: string;
    /**
     * 昵称
     */
    nickname?: string;
    /**
     * 最后登录时间
     */
    lastlogintime?: number;
}

export interface ParsedSessionNew {
    /**
     * 用户唯一id
     */
    userid: string;
    /**
     * 超级管理员标志
     */
    superUser?: boolean;
}

/**
 * 该接口描述了含有自定义Session的Request对象
 */
export interface RequestHaveSession extends Request {
    session: ParsedSessionNew & Session;
}

/**
 * 该接口描述了含有Logger的Request对象
 */
export interface RequestHaveLogger extends RequestHaveSession {
    logger: Logger;
}

/**
 * 该接口描述了Logger中间件适用于三个参数的普通中间件
 */
export interface Middleware {
    (request: RequestHaveLogger, response: Response, next: NextFunction): void
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
    /**
     * 服务器含有文字内容的响应
     */
    message: any;
    /**
     * 服务器响应状态码
     */
    stateCode: stateCode;
    /**
     * 服务器响应的数据
     */
    data?: any;
}

/**
 * 将多个中间件挂载到一个对象上,
 * 这个接口描述了这个类型
 */
export interface MiddlewareTree {
    LogMiddleware: Middleware;
    SessionMiddleware: Middleware;
    verifyMiddleware: typeof verifyMiddleware;
}

/**
 * 该接口描述了一个用于挂载子路由的函数
 */
export interface AddRoute {
    (Middlewares: MiddlewareTree, globalInstance: GlobalData): Router;
}

/**
 * 该类型描述了当前运行的模式
 */
export type mode = 'development' | 'production';

/**
 * 默认的配置文件,包括系统配置等
 */
export type configTreeKeyType = 'configuration_static' | 'log_static' | 'model_assets' | 'model_users';

export type configTree = {
    [key in configTreeKeyType]: any;
}
