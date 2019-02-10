import { Middleware } from "../types";


export const NotFoundMiddleware:Middleware = (request,response)=>response.end('404 Not Found');

