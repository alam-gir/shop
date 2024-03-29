import { ApiError } from "../../lib/api-response-custom";
import jwt, { JwtPayload } from "jsonwebtoken";

export const jwtVerify = (token: string, secret: string) => {
  return jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      throw new ApiError(400, "Token is invalid");
    }
    return decoded as string;
  });
};
