import { Cart, Order, Prisma, Review, User, UserProfile } from "@prisma/client";
import { ApiError } from "../api-response-custom";
import prisma from "./../prisma";
import bcrypt from "bcrypt";

type CreateUserProps = {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
};

type UserType = User & {
  profile: UserProfile;
  cart: Cart;
  orders: Order[];
  reviews: Review[];
};

type Options =
  | {
      withCart?: boolean;
      withProfile?: boolean;
      withOrders?: boolean;
      withReviews?: boolean;
      forAdmin?: boolean;
    }
  | undefined;

const userFieldIncludeOptions = (options?: Options) => {
  return Prisma.validator<Prisma.UserInclude>()({
    profile: options?.withProfile,
    cart: options?.withCart ? { include: { products: true } } : false,
    orders: options?.withOrders,
    reviews: options?.withReviews,
  });
};

export const userServices = {
  getAll: async (options?: Options) => {
    const users = (await prisma.user.findMany({
      include: userFieldIncludeOptions(options),
    })) as UserType[];

    return users.map((user) => {
      const { password, refreshTokens, cartId, ...rest } = user;
      return { ...rest };
    });
  },

  getById: async (id: string, options?: Options) => {
    const user = (await prisma.user.findUnique({
      where: { id },
      include: userFieldIncludeOptions(options),
    })) as UserType;

    if (options?.forAdmin) return user as User;

    const { password, refreshTokens, cartId, ...rest } = user;
    return { ...rest };
  },

  getByEmail: async (email: string, options?: Options) => {
    try {
      const user = (await prisma.user.findUnique({
        where: { email },
        include: userFieldIncludeOptions(options),
      })) as UserType;

      if (options?.forAdmin) return user as User & { profile: UserProfile };

      const { password, refreshTokens, cartId, ...rest } = user;
      return { ...rest };
    } catch (error) {
      return null;
    }
  },

  getByRefreshToken: async (token: string) => {
    return (await prisma.user.findFirst({
      where: { refreshTokens: { has: token } },
      include: { profile: true },
    })) as User & { profile: UserProfile };
  },

  create: async ({ email, name, avatar, password }: CreateUserProps) => {
    try {
      // if have password then it is credential else it is provider signup
      if (password) {
        // hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        if (!hashedPassword) throw new Error("Password hashing failed");

        return await prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            profile: {
              create: {
                name,
                email,
                avatar,
                role: "USER",
              },
            },
            cart: {
              create: {},
            },
          },
          include: {
            profile: true,
          },
        });
      } else {
        return await prisma.user.create({
          data: {
            name,
            email,
            avatar,
            emailVarified: new Date(),
            profile: {
              create: {
                name,
                email,
                avatar,
                role: "USER",
              },
            },
            cart: {
              create: {},
            },
          },
          include: {
            profile: true,
          },
        });
      }
    } catch (error) {
      throw error;
    }
  },

  changeCart: async ({
    userId,
    newCartId,
  }: {
    userId: string;
    newCartId: string;
  }) => {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data: { cartId: newCartId },
      });
    } catch (error) {
      throw error;
    }
  },
  
  addRefreshToken: async (id: string, refresh_token: string) => {
    return await prisma.user.update({
      where: { id: id },
      data: { refreshTokens: { push: refresh_token } },
    });
  },

  removeRefreshToken: async (refresh_token: string) => {
    try {
      const user = await prisma.user.findFirst({
        where: {
          refreshTokens: {
            has: refresh_token,
          },
        },
      });

      if (!user) throw new ApiError(204, "User not found");

      const newRefreshTokensArray = user.refreshTokens.filter(
        (token) => token !== refresh_token
      );

      return await prisma.user.update({
        where: { id: user.id },
        data: { refreshTokens: newRefreshTokensArray },
      });
    } catch (error) {
      return error;
    }
  },

  isPasswordValid: async (password: string, hashedPassword: string) => {
    return await bcrypt.compare(password, hashedPassword);
  },

  remove: async (id: string) => {
    try {
      await prisma.user.delete({
        where: { id: id },
      });
    } catch (error) {
      throw error;
    }
  },
};
