import { UserProfile } from "@prisma/client";
import JWT from "jsonwebtoken";

export const generateRefreshToken = (userId: string) => {
  return JWT.sign({ userId }, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: "15d",
  });
};
export const generateAccessToken = (userProfile: UserProfile) => {
  return JWT.sign(
    { ...userProfile },
    process.env.ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: 60 * 15,
    }
  );
};
