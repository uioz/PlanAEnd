"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const code_1 = require("../code");
const source_1 = require("./source");
/**
 * 说明:
 * /source/json/:year/:start/to/:end
 * 以JSON形式获取源数据
 */
/**
 * 本文件中的路由地址
 */
exports.URL = '/source/json/:year/:start/to/:end';
/**
 * GET下对应的权限下标
 */
exports.LevelIndexOfGet = code_1.LevelCode.View.toString();
exports.MiddlewaresOfGet = [(request, response) => {
        // 此时通过的请求都是经过session验证的请求
        // 此时挂载了logger 和 express-session 中间件
        const year = String(parseInt(request.params.year)), start = String(parseInt(request.params.start)), end = String(parseInt(request.params.end));
        if (source_1.checkNumber(parseInt(year)) && source_1.checkNumber(parseInt(start)) && source_1.checkNumber(parseInt(end))) {
            // TODO 等待编写
        }
        return response.json({
            message: code_1.responseMessage['错误:地址参数错误'],
            stateCode: 400
        });
    }];
