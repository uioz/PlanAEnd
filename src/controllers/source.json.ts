import { LevelCode, SystemErrorCode } from "../code";
import { Middleware } from "../types";
import { globalDataInstance } from "../globalData";
import { checkNumber, DatabasePrefixName } from "./source";
import { code400, logger500, code500 } from "./public";
import * as JSONStream from "JSONStream";
import * as apiCheck from "api-check";
import { GetUserI } from "../helper/user";
import * as JsonStreamHelper from "../helper/jsonstream";
import { controlAreaMiddleware } from "../middleware/controlarea";

/**
 * 说明:
 * /source/json/:year/:start/to/:end
 * 以JSON形式获取源数据
 */

/**
 * 本文件中的路由地址
 */
export const URL = '/api/source/json/:year/:start/to/:end';

/**
 * GET下对应的权限下标
 */
export const LevelIndexOfGet = LevelCode.View.toString();

interface GetParamsShape {
  year: number;
  start: number;
  end: number;
}

interface GetQueryShape {
  speciality?: string;
}

const GetParamsShape = apiCheck.shape({
  year: apiCheck.string,
  start: apiCheck.string,
  end: apiCheck.string
}).strict;

const GetQueryShape = apiCheck.shape({
  speciality: apiCheck.string.optional
}).strict;

/**
 * 这个中间件将 传入的 params 
 * 1. 进行格式校验
 *  1.1 params 格式校验
 *  1.2 query 格式校验
 * 2. 转为数值类型后进行校验
 * 3. 给定的专业的字段是否存在于该用户的控制范围内的校验
 */
const GetCheckMiddleware: Middleware = (request, response, next) => {

  const
    paramsCheckedResult = GetParamsShape(request.params),
    queryCheckedResult = GetQueryShape(request.query);

  if (paramsCheckedResult instanceof Error || queryCheckedResult instanceof Error) {
    return code400(response);
  }

  // 格式化数据为数值型, 并且替换掉之前掉 request 中的格式化前的内容
  const
    year = (request.params.year = parseInt(request.params.year)),
    start = (request.params.start = parseInt(request.params.start)),
    end = (request.params.end = parseInt(request.params.end));

  if (!checkNumber(year) || !checkNumber(start) || !checkNumber(end)) {
    return code400(response);
  }

  // 管理员完成基本格式校验
  // 如果是普通用户且没有指定 query 对应的专业类型, 说明它要获取所有的内容
  // 这两种情况都进行直接跳转, 放弃专业范围校验
  if (request.session.superUser || !request.query.speciality) {
    return next();
  }

  GetUserI()
    .getInfo(request.session.userid)
    .then(({ controlarea }) => {

      // 控制区域数组长度 === 0 则表示可以控制所有专业字段
      if (controlarea.length !== 0) {

        // 检测该用户所控制的区域是否包含了, 它要获取的字段
        // 如果没有则提示错误
        if (controlarea.indexOf(request.query.speciality) === -1) {
          return code400(response);
        }

      }

      return next();

    })
    .catch(error => {
      logger500(request.logger, request.body, SystemErrorCode['错误:数据库回调异常'], error);
      return code500(response);
    });

}

export const MiddlewaresOfGet: Array<Middleware> = [GetCheckMiddleware, controlAreaMiddleware, (request, response) => {

  (async function (params: GetParamsShape, query: GetQueryShape) {

    const
      { year, start, end } = params,
      { speciality } = query,
      controlArea = (request as any).controlArea;

    // 获取符合自身条件的控制区域
    let queryForMongo: object = { speciality: { $in: controlArea} };

    // 如果指定了专业
    if (speciality) {
      if (controlArea.indexOf(speciality) === -1) {
        code400(response);
        return;
      }
      queryForMongo = { speciality };
    }

    globalDataInstance
      .getMongoDatabase()
      .collection(DatabasePrefixName + year)
      .find(queryForMongo, {
        projection: {
          _id: false
        }
      })
      .sort({
        number: 1
      })
      .skip(start)
      .limit(end)
      .stream()
      .pipe(JSONStream.stringify(JsonStreamHelper.open, JsonStreamHelper.spe, JsonStreamHelper.close))
      .pipe(response.type('json'));

  })(request.params, request.query);

}];