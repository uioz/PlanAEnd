"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globalData_1 = require("./globalData");
const initMiddleware_1 = require("./init/initMiddleware");
const filter_1 = require("./middleware/filter");
const logger_1 = require("./middleware/logger");
const types_1 = require("./types");
const source = require("./controllers/source");
const sourceJson = require("./controllers/source.json");
const model = require("./controllers/model");
const user = require("./controllers/user");
const assets = require("./controllers/assets");
exports.default = (app, globalData) => {
    const CookieSecurt = 'hello world', Database = globalData.getMongoDatabase(), SessionMiddleware = initMiddleware_1.GetSessionMiddleware(Database, CookieSecurt), logger = globalData.getLogger(), isDEV = process.env.NODE_ENV = types_1.NODE_ENV.dev;
    const middlewareTree = {
        LogMiddleware: logger_1.LogMiddleware,
        verifyMiddleware: filter_1.verifyMiddleware,
        SessionMiddleware
    };
    app.get(source.URL, SessionMiddleware, logger_1.LogMiddleware, filter_1.verifyMiddleware(source.LevelIndexOfGet), source.MiddlewaresOfGet);
    app.post(source.URL, SessionMiddleware, logger_1.LogMiddleware, filter_1.verifyMiddleware(source.LevelIndexOfPost), source.MiddlewaresOfPost);
    app.get(sourceJson.URL, SessionMiddleware, logger_1.LogMiddleware, filter_1.verifyMiddleware(sourceJson.LevelIndexOfGet), sourceJson.MiddlewaresOfGet);
    app.get(model.URL, SessionMiddleware, logger_1.LogMiddleware, filter_1.verifyMiddleware(model.LevelIndexOfGet), model.MiddlewaresOfGet);
    app.post(model.URL, SessionMiddleware, logger_1.LogMiddleware, filter_1.verifyMiddleware(model.LevelIndexOfPost), model.MiddlewaresOfPost);
    app.get(user.URL, SessionMiddleware, logger_1.LogMiddleware, filter_1.verifyMiddleware(user.LevelIndexOfGet), user.MiddlewareOfGet);
    app.post(user.URL, SessionMiddleware, logger_1.LogMiddleware, filter_1.verifyMiddleware(user.LevelIndexOfPost), user.MiddlewareOfPost);
    app.delete(user.URL, SessionMiddleware, logger_1.LogMiddleware, filter_1.verifyMiddleware(user.LevelIndexOfDelete), user.MiddlewareOfDelete);
    app.use(assets.addRoute(middlewareTree, globalData_1.globalDataInstance));
};
