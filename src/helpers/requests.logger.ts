import { Injectable, NestMiddleware, Logger } from "@nestjs/common";

import { Request, Response, NextFunction } from "express";

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  private logger = new Logger("HTTP");

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, path: url } = request;
    const userAgent = request.get("user-agent") || "";

    response.on("close", () => {
      const { statusCode } = response;
      const contentLength = response.get("content-length");

      this.logger.log(`request body keys length - ${Object.keys(request.body).length}`);
      Object.keys(request.body).map(key => {
        this.logger.log(`r.body key - ${key}`);
        const item = request.body[key];
        this.logger.log(`r.body item - ${item}`);
      });

      this.logger.log(`${method} ${url} ${statusCode} ${contentLength} - ${userAgent} ${ip}`);
    });

    next();
  }
}
