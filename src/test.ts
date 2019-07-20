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
    if (req.url === '/about') {
        res.end('welcome to the about page');
        return;
    }

    next();
})

http.createServer(app).listen(4000);