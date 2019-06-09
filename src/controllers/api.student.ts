import { Router } from "express";
import { AddRoute, Middleware } from "../types";
import * as apiCheck from "api-check";
import { logger400, code400, code200 } from "./public";
import { responseMessage } from "../code";
import { clientOpenFetchMiddleware,clientAccessControlMiddleware } from "../middleware/clientaccess";


const addRoute: AddRoute = ({ LogMiddleware, SessionMiddleware, verifyMiddleware }, globalDataInstance) => {


  const router = Router();

  const
    modelName = 'model_speciality',
    studentName = `source_${new Date().getFullYear()}`,
    modelCollection = globalDataInstance.getMongoDatabase().collection(modelName),
    studenCollection = globalDataInstance.getMongoDatabase().collection(studentName);


  const infoShape = apiCheck.shape({
    number: apiCheck.string,
    name: apiCheck.string,
  }).strict;

  const shapeCheckMiddleware: Middleware = (request, response, next) => {

    const checkedResult = infoShape(request.query);

    if (checkedResult instanceof Error) {
      logger400(request.logger, request.query, undefined, checkedResult);
      code400(response);
      return;
    }

    return next();

  }

  const studenIsExistMiddleware: Middleware = (request, response, next) => {

    (async function (request, query, studenCollection) {

      /**
       * structure of query
       * {
       *  name:string,
       *  number:sting
       * }
       */

      const result = await studenCollection.findOne(query, {
        projection: {
          _id: false
        }
      });

      if (result) {
        request.body.studentInfo = result;
        return next()
      }

      code200(response, responseMessage['错误:用户不存在']);

    })(request, request.query, studenCollection)

  }

  router.get('/api/student/info',
    LogMiddleware,
    shapeCheckMiddleware,
    clientOpenFetchMiddleware,
    clientAccessControlMiddleware,
    studenIsExistMiddleware,
    (request, response) => {

      // TODO waiting test


    });

  router.get('/api/student/result',
    LogMiddleware,
    shapeCheckMiddleware,
    clientOpenFetchMiddleware,
    clientAccessControlMiddleware,
    studenIsExistMiddleware,
    (request,response) => {

    });

  router.post('/api/student/result',
    LogMiddleware,
    shapeCheckMiddleware,
    clientOpenFetchMiddleware,
    clientAccessControlMiddleware,
    studenIsExistMiddleware,
    (request, response) => {

    });

  return router;

}