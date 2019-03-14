import { LevelCode } from "../code";
import { Middleware } from "../types";

/**
 * 简介:
 * 本模块用于管理静态消息通知以及静态图片资源
 * 该模块负责静态消息的获取GET 任何管理员都可以查看
 * 该模块负责静态信息的更新POST 在管理范围内
 * 该模块负责静态消息的删除DELETE 在管理范围内
 * /notcie
 */

// TODO 设计一个管理范围中间件针对于DELETE和POST
// TODO 设计POST的更新方式
/**
 * - 更新服务器名称
 * - 更新客户端名称
 * - 服务器通知
 * - 客户端通知
 * - 专业字段
 */
// TODO 创建数据库
// TODO 拆分文件


/**
 * 本模块对应的地址
 */
export const URL = '/notcie';

/**
 * GET 对应的权限下标(获取不需要权限)
 */
export const LevelIndexOfGet = '';

/**
 * POST 对应的权限下标
 */
export const LevelIndexOfPost = LevelCode.EditIndex.toString();

/**
 * DELETE 对应的下标
 */
export const LevelIndexOfDelete = LevelCode.EditIndex.toString();

/**
 * GET 对应的中间件
 */
export const MiddlewaresOfGet: Array<Middleware> = [(request, response, next) => {
  response.end('ok');
}];


/**
 * POST 对应的中间件
 */
export const MiddlewaresOfPost: Array<Middleware> = [(request, response, next) => {
  response.end('ok');
}];
/**
 * DELETE 对应的中间件
 */
export const MiddlewaresOfDelete: Array<Middleware> = [(request, response, next) => {
  response.end('ok');
}];

