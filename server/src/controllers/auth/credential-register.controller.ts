import { Request, Response } from "express";
import { ApiError } from "../../lib/api-response-custom";
import asyncHandler from "../../lib/async-handler";
import { userServices } from "../../lib/db-services/user.services";

export const credentialRegister = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    try {
      if (!name || !email || !password)
        throw new ApiError(400, "Name, email and password are required");

      const isExist = await userServices.getByEmail(email);
      if (isExist)
        throw new ApiError(
          400,
          "User already registered with this email, please try to login"
        );
        
      // create user
      const user = await userServices.create({ name, email, password });
      if (!user) throw new ApiError(500, "User registration failed");

      // send response

      res.status(201).json({
        success: true,
        message: "User registered successfully",
      });
    } catch (error) {
      throw error;
    }
  }
);
