import { NextFunction, Request, Response } from 'express';

export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - start;
        console.log(
            `${req.method} ${req.url} - ${res.statusCode} [${duration}ms]`,
            `IP: ${req.ip}`
        );
    });

    next();
};