import { AddRoute, RequestHaveLogger, Middleware } from "../types";
import { LevelCode, SystemErrorCode, responseMessage } from "../code";
import { Router } from "express";
import { autoReadOne, responseAndTypeAuth, logger500, code500, code400, logger400, code200 } from "./public";
import * as apiCheck from "api-check";
import { writeOfOpen } from "../model/collectionWrite";
import { JSONParser } from "../middleware/jsonparser";
import { Collection } from "mongoose";
import * as DotProp from "dot-prop";

/**
 * 简介:
 * 该模块负责服务器开闭管理
 * 顶级URL为/open
 * 本模块导出的是模块化路由
 * 该路由下有多个路径
 */

/**
 * 本模块使用的集合名称
 */
export const CollectionName = 'configuration_static';

/**
 * GET 对应的权限下标
 */
export const LevelIndexOfGet = LevelCode.SuperUserIndex.toString();

/**
 * POST对应的权限下标
 */
export const LevelIndexOfPost = LevelIndexOfGet;

/**
 * 该接口描述了POST请求用户传递内容数据的类型
 */
interface PostRangeShape {
  /**
   * 开始时间
   */
  startTime: string;
  /**
   * 结束时间
   */
  endTime: string;
}

/**
 * range请求格式验证模板
 */
const postRangeShape = apiCheck.shape({
  startTime: apiCheck.string,
  endTime: apiCheck.string,
}).strict;

/**
 * 该接口描述了POST请求用户传递内容数据的类型
 */
interface PostForceShape {
  force: boolean;
}

/**
 * force请求格式验证模板
 */
const postForceShape = apiCheck.shape({
  force: apiCheck.bool
}).strict;

interface Shape {
  force?: boolean;
  open?: boolean;
  range?: boolean;
}

const Shape = apiCheck.shape({
  force: apiCheck.bool.optional,
  open: apiCheck.bool.optional,
  range: apiCheck.bool.optional
}).strict;

async function collectionRead(collection: Collection) {
  return await collection.findOne({}, {
    projection: {
      _id: 0
    }
  });
}

async function collectionWrite(collection: Collection, data: object) {
  return await collection.updateOne({}, {
    $set: {
      ...data
    }
  });
}


const typeCheckMiddleware: Middleware = (request, response, next) => {

  const result = Shape(request.params);

  if (result instanceof Error) {
    code400(response);
    logger400(request.logger, request.params, undefined, result);
  } else {
    next();
  }

};


export const addRoute: AddRoute = ({ LogMiddleware, SessionMiddleware, verifyMiddleware }, globalDataInstance) => {

  const
    router = Router(),
    collection = globalDataInstance.getMongoDatabase().collection(CollectionName),
    verify = verifyMiddleware(LevelIndexOfPost),
    willBeUseMiddleware = [SessionMiddleware, verify, LogMiddleware,typeCheckMiddleware];

  router.get('/open',willBeUseMiddleware, (request: RequestHaveLogger, response) => {

    const Maps = {
      open:'client.open',
      force:'client.force',
      range:'openTimeRange'
    };


    (async function (collection, params, Maps) {

      try {
        responseAndTypeAuth(response, {
          stateCode: 200,
          message: '',
          data: (await collectionRead(collection as any))['client']['open']
        });
      } catch (error) {
        code500(response);
        logger500(request.logger, undefined, undefined, error);
      }

    })(collection, request.params,Maps);

  });

  router.post('/open', SessionMiddleware, verify, LogMiddleware, (request: RequestHaveLogger, response) => {


    (async function (collection) {



    })(collection)

  });

  router.get('/open/range', SessionMiddleware, verify, LogMiddleware, (request: RequestHaveLogger, response) => {

    autoReadOne(collection, response, request.logger).then(({ client }) => {
      responseAndTypeAuth(response, {
        stateCode: 200,
        message: '',
        data: {
          ...client.openTimeRange
        }
      });
    })
      .catch((error) => {
        logger500(request.logger, undefined, undefined, error);
        code500(response);
      });

  });

  router.get('/open/force', SessionMiddleware, verify, LogMiddleware, (request: RequestHaveLogger, response, next) => {
    autoReadOne(collection, response, request.logger).then(({ client }) => {
      responseAndTypeAuth(response, {
        stateCode: 200,
        message: '',
        data: client.force
      });
    }).catch((error) => {
      logger500(request.logger, undefined, undefined, error);
      code500(response);
    });
  });

  router.post('/open/range', SessionMiddleware, verify, LogMiddleware, JSONParser, (request: RequestHaveLogger, response, next) => {

    const
      requestBody: PostRangeShape = request.body,
      checkResult = postRangeShape(requestBody);

    if (checkResult instanceof Error) {
      logger400(request.logger, requestBody, undefined, checkResult);
      return code400(response);
    }

    // 时间是一个ISO8601格式的字符串
    // 使用new Date().toJSON
    // 或者使用new Date().toISOString()生成
    // 使用这两种方式javascript会根据当前地区时间
    // 以格林威治时间0时区为基准进行计算生成符合
    // ISO8601的时间并且时区偏移是0
    // 这里时间存在的意义是进行大小比对,所以不在意
    // 具体时区,这样一来计算时间的时候不用考虑服务器
    // 所运行环境中的时区偏移
    // Date.parse解析时间正确返回日期对象错误返回NaN
    // 但是javascript中NaN!==NaN所以需要借助于ES6的Number.isNaN方法

    const
      { startTime, endTime } = requestBody,
      startDate = Date.parse(startTime),
      endDate = Date.parse(endTime);

    // 时间错误或者给定的起始时间大于等于结束时间则错误
    if (Number.isNaN(startDate) || Number.isNaN(endDate) || startDate >= endDate) {
      logger400(request.logger, requestBody, undefined, undefined);
      return code400(response);
    }

    writeOfOpen(collection, startTime, endTime).then((updateResult) => {
      if (updateResult.result.ok) {
        code200(response);
      } else {
        logger500(request.logger, requestBody, SystemErrorCode['错误:数据库回调异常'], updateResult);
        code500(response);
      }
    })
      .catch((error) => {
        logger500(request.logger, requestBody, undefined, error);
        code500(response);
      });

  });

  router.post('/open/force', SessionMiddleware, verify, LogMiddleware, JSONParser, (request: RequestHaveLogger, response, next) => {

    const
      requestBody = request.body,
      checkResult = postForceShape(requestBody);

    if (checkResult instanceof Error) {
      logger400(request.logger, requestBody, undefined, checkResult);
      return code400(response);
    }

    collection.updateOne({}, {
      $set: {
        'client.force': requestBody.force
      }
    }).then((updateResult) => {

      if (updateResult.result.ok) {
        code200(response);
      } else {
        logger500(request.logger, requestBody, SystemErrorCode['错误:数据库回调异常']);
        code500(response);
      }

    })
      .catch((error) => {
        logger500(request.logger, requestBody, SystemErrorCode['错误:数据库写入失败'], error);
        code500(response);
      });


  });

  return router;

}