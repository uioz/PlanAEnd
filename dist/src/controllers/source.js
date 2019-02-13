"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const code_1 = require("../code");
/**
 * 数据处理地址
 */
exports.URL = '/source';
/**
 * GET下对应的权限下标
 */
exports.LevelIndexOfGet = code_1.LevelCode.DownloadIndex.toString();
/**
 * POST下对应的权限下标
 */
exports.LevelIndexOfPost = code_1.LevelCode.UploadIndex.toString();
/**
 * GET下的处理中间件
 */
exports.MiddlewaresOfGet = [(request, response) => {
        // 此时通过的请求都是经过session验证的请求
        // 此时挂载了logger 和 express-session 中间件
    }];
/**
 * POST下对应的处理中间件
 */
exports.MiddlewaresOfPost = [];
