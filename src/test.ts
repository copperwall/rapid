import http from 'http';
import rapid, { Request, Response } from './index'

const app = rapid();

app.use(function(req : Request, res: Response, next: Function) {
    console.log('first');
    next();
});
app.use(function(req: Request, res: Response, next: Function) {
    console.log('second');
    next();
});
app.use(function(req: Request, res: Response, next: Function) {
    if (req.url === '/') {
        res.end('Welcome to the home page');
        return;
    }

    next();
});

app.use(function(req, res, next) {
    if (req.url !== undefined) {
        if (req.url.match(/^\/about/)) {
            const coolMode = req.query.get('coolMode') === 'true';
            if (coolMode) {
                res.write('!!COOL MODE ACTIVATED!!\n');
            }
            res.end('welcome to the about page');
            return;
        }
    }

    next();
})

http.createServer(app).listen(4000);