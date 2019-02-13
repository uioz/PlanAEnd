import { Express } from "express";
import { GlobalData } from "./globalData";
import { GetExpressSession, GetMongoStore } from "./init/initMiddleware";
import { verifyMiddleware } from "./middleware/filter";
import { LogMiddleware } from "./middleware/logger";
import * as source from "./controllers/source";
import { NODE_ENV } from "./types";

export default (app: Express, globalData: GlobalData) => {

    const
        CookieSecure = 'hello world',
        Database = globalData.getMongoDatabase(),
        SessionStore = GetMongoStore(Database),
        SessionMiddleware = GetExpressSession({
            store: SessionStore,
            secret: CookieSecure
        }),
        logger = globalData.getLogger(),
        isDEV = process.env.NODE_ENV = NODE_ENV.dev;

    app.get(source.URL, SessionMiddleware,LogMiddleware,verifyMiddleware(source.LevelIndexOfGet),(request,response)=>{
        response.end('get pass');
    });
    app.post(source.URL, SessionMiddleware,LogMiddleware,verifyMiddleware(source.LevelIndexOfPost),(request,response)=>{
        response.end('post pass');
    });


}