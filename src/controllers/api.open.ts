import * as apiCheck from "api-check";
import * as DotProp from "dot-prop";
import { Router } from "express";
import { LevelCode } from "../code";
import { JSONParser } from "../middleware/jsonparser";
import { AddRoute, Middleware, RequestHaveLogger } from "../types";
import { code200, code400, code500, collectionRead, collectionWrite, logger400, logger500, responseAndTypeAuth } from "./public";

const
  LevelCodeForUrl = LevelCode.SuperUserIndex.toString(),
  CollectionName = 'configuration_static';

const checkParamsMiddleware: Middleware = (request, response, next) => {

  const typeCanPass = new Set(['open', 'range', 'force']);

  if (typeCanPass.has(request.params.type)) {
    next();
  } else {
    code400(response);
    logger400(request.logger, request.params, undefined, undefined);
  }

}


const Shape = apiCheck.shape({
  force: apiCheck.bool.optional,
  open: apiCheck.bool.optional,
  range: apiCheck.shape({
    startTime: apiCheck.number.optional,
    endTime: apiCheck.number.optional
  }).strict.optional
}).strict;

const checkDataMiddlewareForPost: Middleware = (request, response, next) => {

  const checkResult = Shape(request.body);

  if (checkResult instanceof Error) {
    code400(response);
    logger400(request.logger, request.body, undefined, checkResult);
  } else {
    next();
  }

}

export const addRoute: AddRoute = ({ LogMiddleware, SessionMiddleware, verifyMiddleware }, globalDataInstance) => {

  const
    router = Router(),
    verify = verifyMiddleware(LevelCodeForUrl),
    middlewaresForGet = [SessionMiddleware, verify, LogMiddleware, checkParamsMiddleware],
    middlewaresForPost = [SessionMiddleware, verify, LogMiddleware, JSONParser, checkDataMiddlewareForPost],
    collection = globalDataInstance.getMongoDatabase().collection(CollectionName);

  const Maps = {
    open: 'client.open',
    force: 'client.force',
    range: 'client.openTimeRange'
  };


  router.get('/api/open/:type', middlewaresForGet, (request: RequestHaveLogger, response) => {

    (async function (collection, path: string) {

      responseAndTypeAuth(response, {
        stateCode: 200,
        message: '',
        data: DotProp.get((await collectionRead(collection as any)), path)
      });

    })(collection, Maps[request.params.type]).catch((error) => {
      code500(response);
      logger500(request.logger, undefined, undefined, error);
    });

  });

  router.post('/api/open', middlewaresForPost, (request: RequestHaveLogger, response) => {



    (async function (data: object) {

      const result = await collectionRead(collection as any);

      for (const keyName of Object.keys(data)) {
        DotProp.set(result, Maps[keyName], data[keyName]);
      }

      code200(response);

      collectionWrite(collection as any,result);

    })(request.body).catch((error) => {
      code500(response);
      logger500(request.logger, undefined, undefined, error);
    });

  });

  return router;

}