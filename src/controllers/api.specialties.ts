import { AddRoute, RequestHaveSession, RequestHaveLogger } from "../types";
import { Router } from "express";
import { code500, responseAndTypeAuth, logger500 } from "./public";
import { SystemErrorCode } from "../code";


/**
 * 本模块使用的集合前缀
 */
export const CollectionNamePrefix = 'source_';
export const CollectionName = 'model_speciality';

/**
 * GET请求对应的权限下标
 */
export const LevelIndexOfGet = '';


export const addRoute: AddRoute = ({ verifyMiddleware, SessionMiddleware, LogMiddleware }, globalDataInstance) => {

  const
    router = Router();

  router.get('/api/specalties', SessionMiddleware, verifyMiddleware(LevelIndexOfGet), LogMiddleware, (request: RequestHaveLogger, response) => {

    /**
     * 使用 query 配合年份查询历史记录
     * 不使用 query 按照专业结构返回
     */

    const { year } = request.query;

    if (year) {

      const yearToNumber = parseInt(year);

      if (!yearToNumber || (yearToNumber !== yearToNumber)) {
        return code500(response);
      }

      const
        collection = globalDataInstance.getMongoDatabase().collection(CollectionNamePrefix + yearToNumber),
        resultSet = new Set();

      collection.find({}, {
        projection: {
          _id: 0,
          speciality: 1
        }
      }).forEach(({ speciality }) => resultSet.add(speciality), () => {

        if (resultSet.size) {
          return responseAndTypeAuth(response, {
            stateCode: 200,
            data: Array.from(resultSet),
            message: ''
          });
        }

      });

    } else {

      globalDataInstance
        .getMongoDatabase()
        .collection(CollectionName)
        .findOne({},{
          projection:{
            _id:false
          }
        })
        .then(result => {

          responseAndTypeAuth(response, {
            stateCode: 200,
            message: '',
            data: Object.keys(result)
          });

        })
        .catch(error => {
          logger500(request.logger, undefined, SystemErrorCode['错误:数据库回调异常'], error);
          return code500(response);
        })
    }

  });

  return router;

}