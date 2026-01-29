import { ZodError } from "zod";
import { CustomError } from "./CustomError";

export class RequestValidationError extends CustomError {
  statusCode = 400;

  constructor(public error: ZodError) {
    super("Invalid request parameters");
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeError() {
    return this.error.issues.map((issue) => ({
      message: issue.message,
      field: issue.path.join("."),
    }));
  }
}
