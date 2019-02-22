import { read as XlsxRead, utils as XlsxUtils, write as XlsxWrite } from "xlsx";
import { LevelCode,responseMessage } from "../code";
import { Middleware,restrictResponse } from "../types";
import { globalDataInstance } from "../globalData";
import { checkNumber } from "./source";


/**
 * 说明:
 * /source/json/:year/:start/to/:end
 * 以JSON形式获取源数据
 */

/**
 * 本文件中的路由地址
 */
export const URL = '/source/json/:year/:start/to/:end';

/**
 * GET下对应的权限下标
 */
export const LevelIndexOfGet = LevelCode.View.toString();

export const MiddlewaresOfGet: Array<Middleware> = [(request, response) => {

    // 此时通过的请求都是经过session验证的请求
    // 此时挂载了logger 和 express-session 中间件

    const 
        year = String(parseInt(request.params.year)),
        start = String(parseInt(request.params.start)),
        end = String(parseInt(request.params.end));


    if (checkNumber(parseInt(year)) && checkNumber(parseInt(start)) && checkNumber(parseInt(end))){

        // TODO 等待编写


    }

    return response.json({
        message: responseMessage['错误:地址参数错误'],
        stateCode: 400
    } as restrictResponse);

}];