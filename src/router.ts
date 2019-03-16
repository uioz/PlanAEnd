import { Express } from "express";
import { GlobalData } from "./globalData";
import { GetExpressSession, GetMongoStore,GetSessionMiddleware } from "./init/initMiddleware";
import { verifyMiddleware } from "./middleware/filter";
import { LogMiddleware } from "./middleware/logger";
import { NODE_ENV } from "./types";
import * as source from "./controllers/source";
import * as sourceJson from "./controllers/source.json";
import * as model from "./controllers/model";
import * as user from "./controllers/user";
import * as assets from "./controllers/assets";

export default (app: Express, globalData: GlobalData) => {

    const
        CookieSecurt = 'hello world',
        Database = globalData.getMongoDatabase(),
        SessionMiddleware = GetSessionMiddleware(Database,CookieSecurt),
        logger = globalData.getLogger(),
        isDEV = process.env.NODE_ENV = NODE_ENV.dev;

    app.get(source.URL, SessionMiddleware,LogMiddleware,verifyMiddleware(source.LevelIndexOfGet),source.MiddlewaresOfGet);
    app.post(source.URL, SessionMiddleware,LogMiddleware,verifyMiddleware(source.LevelIndexOfPost),source.MiddlewaresOfPost);
    app.get(sourceJson.URL,SessionMiddleware,LogMiddleware,verifyMiddleware(sourceJson.LevelIndexOfGet),sourceJson.MiddlewaresOfGet);
    app.get(model.URL,SessionMiddleware,LogMiddleware,verifyMiddleware(model.LevelIndexOfGet),model.MiddlewaresOfGet);
    app.post(model.URL,SessionMiddleware,LogMiddleware,verifyMiddleware(model.LevelIndexOfPost),model.MiddlewaresOfPost);
    app.get(user.URL,SessionMiddleware,LogMiddleware,verifyMiddleware(user.LevelIndexOfGet),user.MiddlewareOfGet);
    app.post(user.URL,SessionMiddleware,LogMiddleware,verifyMiddleware(user.LevelIndexOfPost),user.MiddlewareOfPost);
    app.delete(user.URL,SessionMiddleware,LogMiddleware,verifyMiddleware(user.LevelIndexOfDelete),user.MiddlewareOfDelete);
    app.get(assets.URL,SessionMiddleware,LogMiddleware,assets.MiddlewareOfGet);
    

}