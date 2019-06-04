import * as apiCheck from "api-check";
import * as DotProp from "dot-prop";
import { Router } from "express";
import * as Multer from "multer";
import { resolve as PathResolve } from "path";
import { responseMessage } from "../code";
import { ImageDiskStorageGenerator, normalImageFilter } from "../helper/multer";
import { JSONParser } from "../middleware/jsonparser";
import { AddRoute, Middleware, RequestHaveLogger } from "../types";
import { LevelCode } from "../utils/privilege";
import {
  code200,
  code400,
  code500,
  collectionRead,
  collectionWrite,
  logger400,
  logger500,
  responseAndTypeAuth
} from "./public";

export const addRoute: AddRoute = ({ LogMiddleware, SessionMiddleware, verifyMiddleware }, globalDataInstance) => {

  const
    systemConfig = globalDataInstance.getConfig('configuration_static'),
    imageSavePath = PathResolve(globalDataInstance.getCwd(), DotProp.get(systemConfig, 'server.publicFilePath')),
    multer = Multer({
      storage: ImageDiskStorageGenerator(imageSavePath),
      limits: {
        fields: 2, // 非文件field字段的数量
        fileSize: 1024 * 1024, // 文件大小限制在10MB以下
        files: 1, // 文件数量
      },
      fileFilter: normalImageFilter
    });

  const
    router = Router(),
    verify = verifyMiddleware(LevelCode.StaticMessage.toString()),
    middlewaresForGet = [SessionMiddleware, verify, LogMiddleware],
    middlewaresForPost = middlewaresForGet.concat(multer.single('file'));

  const
    collectionName = 'model_assets',
    collection = globalDataInstance.getMongoDatabase().collection(collectionName),
    IMAGELIST_PATH = 'image.imagelist';

  /**
   * 获取已有的图片信息
   */
  router.get('/api/assets/static/photos', middlewaresForGet, (request: RequestHaveLogger, response) => {

    (async function (collection) {

      const result = await collectionRead(collection);

      responseAndTypeAuth(response, {
        stateCode: 200,
        message: '',
        data: DotProp.get(result, IMAGELIST_PATH)
      });

    })(collection);

  });

  router.post('/api/assets/static/photos', middlewaresForPost, (request: RequestHaveLogger, response) => {

    (async function (collection) {

      const responseAndData = {
        id: request.file.filename,
        fileName: request.file.originalname,
        src: globalDataInstance.makePublicFileUrl(request.file.filename)
      };

      try {
        await collection.updateOne({}, {
          $push: {
            [IMAGELIST_PATH]: responseAndData
          }
        });
      } catch (error) {
        code500(response);
        logger500(request.logger, undefined, undefined, error);
        return;
      }

      responseAndTypeAuth(response, {
        stateCode: 200,
        message: responseMessage['数据上传成功'],
        data: responseAndData
      });

    })(collection).catch(error => {

      // 安心的假设删除不会出现错误
      collection.updateOne({}, {
        $pull: {
          [IMAGELIST_PATH]: {
            id: request.file.filename
          }
        }
      });

      logger500(request.logger, undefined, undefined, error)

    });

  });

  router.delete('/api/assets/static/photos/:id', middlewaresForGet, (request: RequestHaveLogger, response) => {

    (async function (collection, imageId) {

      await collection.updateOne({}, {
        $pull: {
          [IMAGELIST_PATH]: {
            id: imageId
          }
        }
      });

      code200(response, responseMessage['删除成功']);

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

  interface PostAssetsBody {
    id: string;
    src: string;
    fileName: string
  }

  const middlewareForAssetsCheck: Middleware = (request, response, next) => {

    const shape = apiCheck.shape({
      id: apiCheck.string,
      src: apiCheck.string,
      fileName: apiCheck.string
    }).strict;

    const checkedResult = shape(request.body);

    if (checkedResult instanceof Error) {
      code400(response);
      logger400(request.logger, request.body, undefined, checkedResult);
    } else {
      return next();
    }

  }

  const middlewaresAssets = middlewaresForGet.concat(checkTypeForAppImage, JSONParser, middlewareForAssetsCheck);

  router.post('/api/assets/app/image/:type', middlewaresAssets, (request: RequestHaveLogger, response) => {

    const MapsForAppImage = {
      logo: 'image.logo',
      serverbackground: 'image.serverbackground',
      clientbackground: 'image.clientbackground'
    };

    (async function (collection, type, body: PostAssetsBody) {

      const findResult = await collection.findOne({
        'image.imagelist.id': body.id
      });

      // 数组中不存在内容返回null
      if (!findResult) {
        return code400(response);
      }

      const result = DotProp.set((await collectionRead(collection)), MapsForAppImage[type], body.id);

      collectionWrite(collection, result);

      code200(response);

    })(collection, request.params.type, request.body).catch(error => {
      code500(response);
      logger500(request.logger, request.params, undefined, error);
    });

  });

  return router;

}