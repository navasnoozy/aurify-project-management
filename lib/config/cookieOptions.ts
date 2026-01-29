// import { CookieOptions } from "express";

export const cookieOptions: any = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
};
