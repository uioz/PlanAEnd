import { Express } from "express";
import { GlobalData } from "./globalData";
import { GetExpressSession,GetMongoStore } from "./init/initMiddleware";
import { verifyMiddleware } from "./middleware/filter";
import { LogMiddleware } from "./middleware/logger";
import * as source from "./controllers/source";

export default (app:Express,globalData:GlobalData)=>{

    const 
        CookieSecure = 'hello world',
        Database = globalData.getMongoDatabase(),
        SessionStore = GetMongoStore(Database),
        SessionMiddleware = GetExpressSession({
            store:SessionStore,
            secret:CookieSecure
        });

    app.get(source.URL,verifyMiddleware(source.LEVEL))
    app.delete(source.URL,verifyMiddleware(source.LEVEL))
    app.post(source.URL,verifyMiddleware(source.LEVEL))


}