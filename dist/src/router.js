"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const initMiddleware_1 = require("./init/initMiddleware");
const filter_1 = require("./middleware/filter");
const source = require("./controllers/source");
const types_1 = require("./types");
exports.default = (app, globalData) => {
    const CookieSecure = 'hello world', Database = globalData.getMongoDatabase(), SessionStore = initMiddleware_1.GetMongoStore(Database), SessionMiddleware = initMiddleware_1.GetExpressSession({
        store: SessionStore,
        secret: CookieSecure
    }), logger = globalData.getLogger(), isDEV = process.env.NODE_ENV = types_1.NODE_ENV.dev;
    if (isDEV) {
        app.get('/debug/:levelcode', SessionMiddleware, (request, response) => {
            const levelCode = request.params.levelcode;
            if (levelCode.length !== 7) {
                return response.end('Error');
            }
            request.session.levelCode = levelCode;
            request.session.userId = levelCode;
            return response.end(`levelCode = ${levelCode}`);
        });
    }
    app.get(source.URL, SessionMiddleware, filter_1.verifyMiddleware(source.LevelIndexOfGet), (request, response) => {
        response.end('get pass');
    });
    app.post(source.URL, SessionMiddleware, filter_1.verifyMiddleware(source.LevelIndexOfPost), (request, response) => {
        response.end('post pass');
    });
};
