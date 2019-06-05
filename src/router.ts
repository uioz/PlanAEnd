import { Express } from "express";
import { GlobalData, globalDataInstance } from "./globalData";
import { GetSessionMiddleware } from "./init/initMiddleware";
import { verifyMiddleware } from "./middleware/filter";
import { LogMiddleware } from "./middleware/logger";
import { MiddlewareTree } from "./types";
import * as source from "./controllers/source";
import * as sourceJson from "./controllers/source.json";
import * as model from "./controllers/model";
import * as assets from "./controllers/assets";
import * as open from "./controllers/api.open";
import * as login from "./controllers/login";
import * as logout from "./controllers/logout";
import * as apiState from "./controllers/api.state";
import * as apiServerBase from "./controllers/api.server.base";
import * as apiClientBase from "./controllers/api.client.base";
import * as apiSpecialties  from "./controllers/api.specialties";
import * as apiAssets from "./controllers/api.assets";
import * as apiAssetsStatic from "./controllers/api.assets.static";
import * as apiUsers from "./controllers/api.users";

export default (app: Express, globalData: GlobalData) => {

    const
        CookieSecurt = 'hello world',
        Database = globalData.getMongoDatabase(),
        SessionMiddleware = GetSessionMiddleware(Database,CookieSecurt);
    
    const middlewareTree:MiddlewareTree = {
        LogMiddleware:LogMiddleware(globalData.getLogger()),
        verifyMiddleware,
        SessionMiddleware
    }

    app.get(source.URL, SessionMiddleware,middlewareTree.LogMiddleware,verifyMiddleware(source.LevelIndexOfGet),source.MiddlewaresOfGet);
    app.post(source.URL, SessionMiddleware,middlewareTree.LogMiddleware,verifyMiddleware(source.LevelIndexOfPost),source.MiddlewaresOfPost);
    app.get(sourceJson.URL,SessionMiddleware,middlewareTree.LogMiddleware,verifyMiddleware(sourceJson.LevelIndexOfGet),sourceJson.MiddlewaresOfGet);
    app.get(model.URL,SessionMiddleware,middlewareTree.LogMiddleware,verifyMiddleware(model.LevelIndexOfGet),model.MiddlewaresOfGet);
    app.post(model.URL,SessionMiddleware,middlewareTree.LogMiddleware,verifyMiddleware(model.LevelIndexOfPost),model.MiddlewaresOfPost);
    app.use(assets.addRoute(middlewareTree,globalDataInstance));
    app.use(open.addRoute(middlewareTree, globalDataInstance));
    app.use(login.addRoute(middlewareTree,globalDataInstance));
    app.use(logout.addRoute(middlewareTree,globalDataInstance));
    app.use(apiState.addRoute(middlewareTree,globalDataInstance));
    app.use(apiServerBase.addRoute(middlewareTree,globalDataInstance));
    app.use(apiClientBase.addRoute(middlewareTree,globalDataInstance));
    app.use(apiSpecialties.addRoute(middlewareTree,globalDataInstance));
    app.use(apiAssets.addRoute(middlewareTree,globalDataInstance));
    app.use(apiAssetsStatic.addRoute(middlewareTree,globalDataInstance));
    app.use(apiUsers.addRoute(middlewareTree, globalDataInstance));

}