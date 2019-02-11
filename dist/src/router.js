"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const initMiddleware_1 = require("./init/initMiddleware");
const filter_1 = require("./middleware/filter");
const source = require("./controllers/source");
exports.default = (app, globalData) => {
    const CookieSecure = 'hello world', Database = globalData.getMongoDatabase(), SessionStore = initMiddleware_1.GetMongoStore(Database), SessionMiddleware = initMiddleware_1.GetExpressSession({
        store: SessionStore,
        secret: CookieSecure
    });
    app.get(source.URL, filter_1.verifyMiddleware(source.LEVEL));
    app.delete(source.URL, filter_1.verifyMiddleware(source.LEVEL));
    app.post(source.URL, filter_1.verifyMiddleware(source.LEVEL));
};
