"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const code_1 = require("../code");
/**
 * 说明:
 * /source/json/:start/to/:end
 * 以JSON形式获取源数据
 */
/**
 * 本文件中的路由地址
 */
exports.URL = '/source/json/:start/to/:end';
/**
 * GET下对应的权限下标
 */
exports.LevelIndexOfGet = code_1.LevelCode.View.toString();
exports.MiddlewaresOfGet = [(request, response) => {
        // 此时通过的请求都是经过session验证的请求
        // 此时挂载了logger 和 express-session 中间件
        response.end('success');
    }];
