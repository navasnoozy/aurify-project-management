import { NextResponse } from "next/server";
import { CustomError } from "@/lib/errors/CustomError";
import { ZodError } from "zod";
import { RequestValidationError } from "@/lib/errors/RequestValidationError";

export const handleApiError = (error: unknown) => {
  console.error("API Error:", error);

  if (error instanceof CustomError) {
    return NextResponse.json({ success: false, errors: error.serializeError() }, { status: error.statusCode });
  }

  if (error instanceof ZodError) {
    const formattingError = new RequestValidationError(error);
    return NextResponse.json({ success: false, errors: formattingError.serializeError() }, { status: formattingError.statusCode });
  }

  return NextResponse.json(
    {
      success: false,
      message: "Something went wrong",
      errors: [{ message: (error as Error).message || "Internal Server Error" }],
    },
    { status: 500 },
  );
};
