import errorhandler from "errorhandler";
import { NextFunction, Response } from "express";

module.exports = function errorHandling () {
  if (process.env.ENV === "dev") {
    return errorhandler();
  } else {
    return (_err: Error, _req: Request, res: Response, _next: NextFunction) => {
      res.status(500).send("Oups, something went wrong...");
    };
  }
};
