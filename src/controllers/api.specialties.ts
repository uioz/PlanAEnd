import { AddRoute, RequestHaveSession } from "../types";
import { Router } from "express";
import { code500, responseAndTypeAuth } from "./public";


/**
 * 本模块使用的集合前缀
 */
export const CollectionNamePrefix = 'source_';

/**
 * GET请求对应的权限下标
 */
export const LevelIndexOfGet = '';


export const addRoute: AddRoute = ({ verifyMiddleware, SessionMiddleware }, globalDataInstance) => {

  const
    router = Router();

  router.get('/api/specalties/:year', SessionMiddleware, verifyMiddleware(LevelIndexOfGet), (request: RequestHaveSession, response) => {

    const yearToNumber = parseInt(request.params.year);

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
          message: Array.from(resultSet)
        })
      }

    });

  });

  return router;

}