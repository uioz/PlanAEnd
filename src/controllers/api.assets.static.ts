import { AddRoute, RequestHaveLogger, Middleware } from "../types";
import { Router } from "express";
import * as DotProp from "dot-prop";
import { LevelCode } from "../utils/privilege";
import { GetFileStoreMiddleware } from "../init/initMiddleware";
import { resolve as PathResolve } from "path";
import { collectionRead,collectionWrite } from "./public";

export const addRoute: AddRoute = ({ LogMiddleware, SessionMiddleware, verifyMiddleware }, globalDataInstance)=>{

  const 
    router = Router(),
    verify = verifyMiddleware(LevelCode.StaticMessage.toString()),
    systemConfig = globalDataInstance.getConfig('systemConfig'),
    assetsPath = PathResolve(globalDataInstance.getCwd(), DotProp.get(systemConfig, 'server.publicFilePath')),
    middlewaresForGet = [SessionMiddleware,verify,LogMiddleware],
    middlewaresForPost = middlewaresForGet.concat(GetFileStoreMiddleware(assetsPath) as any)

  router.get('/api/assets/static/photos',middlewaresForGet,(request:RequestHaveLogger,response)=>{



  });


  router.post('/api/assets/static/photos',middlewaresForPost,()=>{

  })

  return router;

}