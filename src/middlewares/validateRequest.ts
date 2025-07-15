import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { ErrorFactory } from "../errors/errorFactory";

export function validateRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((err) => err.msg)
      .join("; ");
    throw ErrorFactory.validation(errorMessages);
  }
  next();
}
