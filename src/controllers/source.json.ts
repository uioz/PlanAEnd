import { read as XlsxRead, utils as XlsxUtils, write as XlsxWrite } from "xlsx";
import { LevelCode } from "../code";
import { Middleware } from "../types";
import { globalDataInstance } from "../globalData";

/**
 * 说明:
 * /source/json/:start/to/:end
 * 以JSON形式获取源数据
 */

/**
 * 本文件中的路由地址
 */
export const URL = '/source/json/:start/to/:end';

/**
 * GET下对应的权限下标
 */
export const LevelIndexOfGet = LevelCode.View.toString();

export const MiddlewaresOfGet:Array<Middleware> =[(request,response)=>{

    // 此时通过的请求都是经过session验证的请求
    // 此时挂载了logger 和 express-session 中间件

    response.end('success');

}]