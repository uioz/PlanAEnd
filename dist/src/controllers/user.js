"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const code_1 = require("../code");
/**
 * 简介:
 * 该模块负责用户信息的获取 GET
 * 该模块复杂用户的添加 POST
 * 该模块负责用户的删除 DELETE
 * URL:
 * /user
 */
/**
 * 本模块对应的URL地址
 */
exports.URL = '/user';
/**
 * GET 对应的权限下标
 */
exports.LevelIndexOfGet = code_1.LevelCode.ManagementIndex.toString();
/**
 * POST 对应的权限下标
 */
exports.LevelIndexOfPost = code_1.LevelCode.ManagementIndex.toString();
/**
 * DELETE 对应的权限下标
 */
exports.LevelIndexOfDelete = code_1.LevelCode.ManagementIndex.toString();
/**
 * 本模块对应的集合名称
 */
exports.CollectionName = 'model_users';
/**
 * GET 对应的中间件
 */
exports.MiddlewareOfGet = [(request, response, next) => {
        response.end('ok');
    }];
/**
 * POST 对应的中间件
 */
exports.MiddlewareOfPost = [(request, response, next) => {
        response.end('ok');
    }];
/**
 * Delete 对应的中间件
 */
exports.MiddlewareOfDelete = [(request, response, next) => {
        response.end('ok');
    }];