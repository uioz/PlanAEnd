import { AddRoute, RequestHaveLogger, Middleware } from "../types";
import { Router } from "express";
import * as DotProp from "dot-prop";
import { LevelCode } from "../utils/privilege";
import * as Multer from "multer";
import { ImageDiskStorageGenerator } from "../helper/multer";
import { resolve as PathResolve } from "path";
import { collectionRead, collectionWrite, responseAndTypeAuth, code200, code500, logger500, code400, logger400 } from "./public";
import { responseMessage } from "../code";
import { JSONParser } from "../middleware/jsonparser";

export const addRoute: AddRoute = ({ LogMiddleware, SessionMiddleware, verifyMiddleware }, globalDataInstance) => {

  const
    systemConfig = globalDataInstance.getConfig('systemConfig'),
    imageSavePath = PathResolve(globalDataInstance.getCwd(), DotProp.get(systemConfig, 'server.publicFilePath')),
    multer = Multer({
      storage:ImageDiskStorageGenerator(imageSavePath),
      limits:{
        fields:2, // 非文件field字段的数量
        fileSize:1024*1024, // 文件大小限制在10MB以下
        files:1, // 文件数量
      }
    });

  const
    router = Router(),
    verify = verifyMiddleware(LevelCode.StaticMessage.toString()),
    middlewaresForGet = [SessionMiddleware, verify, LogMiddleware],
    middlewaresForPost = middlewaresForGet.concat(multer.single('file'));

  const
    collectionName = 'model_assets',
    collection = globalDataInstance.getMongoDatabase().collection(collectionName);

  /**
   * 获取已有的图片信息
   */
  router.get('/api/assets/static/photos', middlewaresForGet, (request: RequestHaveLogger, response) => {

    (async function (collection) {

      const result = await collectionRead(collection);

      responseAndTypeAuth(response, {
        stateCode: 200,
        message: '',
        data: DotProp.get(result, 'image.imagelist')
      });

    })(collection);

  });


  router.post('/api/assets/static/photos', middlewaresForPost, (request: RequestHaveLogger, response) => {

    (async function (collection) {

      console.log(request.file);
      console.log(request.files);

      response.end();

    })(collection);

  });

  router.delete('/api/assets/static/photos/:id', middlewaresForGet, (request: RequestHaveLogger, response) => {


    (async function (collection, imageId) {

      await collection.updateOne({}, {
        $pull: {
          'image.imagelist': {
            id: imageId
          }
        }
      });

      code200(response, responseMessage['删除成功'])

    })(collection, request.params.id).catch(error => {

      code500(response);
      logger500(request.logger, request.params, undefined, error);

    });

  });

  const checkTypeForAppImage: Middleware = (request, response, next) => {

    const passTypeSet = new Set(['logo', 'serverbackground', 'clientbackground']);

    if (passTypeSet.has(request.params.type)) {
      next();
    } else {
      code400(response);
      logger400(request.logger, request.params);
    }

  }

  const MapsForAppImage = {
    logo: 'image.logo',
    serverbackground: 'image.serverbackground',
    clientbackground: 'image.clientbackground'
  }

  router.post('/api/assets/app/image/:type', middlewaresForGet.concat(checkTypeForAppImage, JSONParser), (request: RequestHaveLogger, response) => {

    (async function (collection, maps: object) {

      // request.body

    })(collection, MapsForAppImage).catch(error => {
      code500(response);
      logger500(request.logger, request.params, undefined, error);
    });

  });

  return router;

}