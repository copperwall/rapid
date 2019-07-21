import { IncomingMessage, ServerResponse } from "http";
import url from 'url';

export interface Request extends IncomingMessage {
    query: URLSearchParams
}

export interface Response extends ServerResponse { }

type MiddlewareFn = (
    req: Request,
    res: Response,
    next: Function
) => void

const queryParser : MiddlewareFn = (req, res, next) => {
    if (req.query === undefined && typeof req.url === "string") {
        const parsedUrl = url.parse(req.url);
        const query = parsedUrl.query || undefined;
        req.query = new url.URLSearchParams(query)
    }

    next();
}

const defaultMiddlewares = [
    queryParser
];

export default function lite_server() {
    let middlewares : Array<MiddlewareFn> = [...defaultMiddlewares];

    function handleRequest(req : Request, res : Response, done : Function) {
        if (middlewares.length == 0) {
            throw new Error('You need some middlewares. We didn\'t find any.');
        }

        // handle the request by running through middleware.
        const it = middlewares[Symbol.iterator]();
        let { value: middleware, done : noMoreMiddleware }: { value: Function, done: boolean } = it.next();

        function next(err: any) {
            let { value: middleware, done: noMoreMiddleware } = it.next();

            if (noMoreMiddleware) {
                done(err);
                return;
            }

            middleware(req, res, next);
        }

        middleware(req, res, next);
    }

    // This can be handle for now
    // Thread req, res, next throw all middlewares.
    function app(req : IncomingMessage, res: ServerResponse, callback?: Function) {
        if (callback === undefined) {
            callback = finalhandler(req, res);
        }

        handleRequest(req as Request, res as Response, callback);

    }

    app.use = function use(fn: MiddlewareFn)  {
        middlewares.push(fn);
    };

    return app;
}

interface ServerError {
    status?: number,
    statusCode?: number,
    message?: string
}

function finalhandler(req: IncomingMessage, res: ServerResponse) {
    return function next(err?: ServerError) {
        if (err !== undefined) {
            const { message, statusCode, status } : { message?: string, statusCode?: number, status?: number } = err || {};
            if (message !== undefined) {
                res.statusMessage = message;
            }

            if (statusCode !== undefined) {
                res.statusCode = statusCode;
            } else if (status !== undefined) {
                res.statusCode = status;
            }
        } else {
            res.statusCode = 404;
            res.statusMessage = "Not found";
            res.end();
        }
    }
}