import { Response } from "express";

export const setRefreshTokenToCookie = (
  res: Response,
  refresh_token: string
) => {
  res.cookie("refresh_token", refresh_token, {
    httpOnly: true,
    secure: true,
    maxAge: 1000 * 60 * 60 * 24 * 15, // 15 days
  });
};

export const setAccessTokenToCookie = (res: Response, access_token: string) => {
  res.cookie("access_token", access_token, {
    httpOnly: true,
    secure: true,
    maxAge: 1000 * 60 * 15 , // 15 min
  });
};
