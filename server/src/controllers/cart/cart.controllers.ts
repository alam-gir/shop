import { NextFunction, Request, Response } from "express";
import asyncHandler from "./../../lib/async-handler";
import { RequestWithUser } from "../../../@types/custom";
import { CartItem } from "../../types/types";
import { cartServices } from "../../lib/db-services/cart.services";
import { ApiError } from "../../lib/api-response-custom";

export const cartControllers = {
  getCart: asyncHandler(async (req: RequestWithUser, res: Response) => {
    const cartId = req.cookies.cart_id;
    if (!cartId) throw new ApiError(404, "Cart id not found");

    const cart = await cartServices.get(cartId);
    if (!cart) throw new ApiError(404, "Cart not found");

    return res.status(200).json({ success: true, cart });
  }),

  addItem: asyncHandler(async (req: RequestWithUser, res: Response) => {
    const user = req.user;
    const cartId = req.cookies.cart_id;

    const { product_id, inventory_id } = req.body as CartItem;
    if (!product_id || !inventory_id)
      throw new ApiError(400, "product_id and inventory_id are required");

    let cart: any;

    if (user?.cartId) {
      // add item to user cart
      cart = await cartServices.addItem(user.cartId, {
        product_id,
        inventory_id,
      });

      // ensure that user cartId is set to cookie
      setCartIdToCookie(res, user.cartId);
    } else {
      if (cartId) {
        // add item to cart
        cart = await cartServices.addItem(cartId, { product_id, inventory_id });
      } else {
        cart = await cartServices.create({ product_id, inventory_id });
        if (!cart) throw new ApiError(400, "Failed to create cart");

        setCartIdToCookie(res, cart.id);
      }
    }

    if (!cart) throw new ApiError(400, "Failed to add item to cart");

    return res
      .status(201)
      .json({ success: true, message: "product added to cart", cart });
  }),

  removeItem: asyncHandler(async (req: RequestWithUser, res: Response) => {

    const cart_id = req.cookies.cart_id;
    if (!cart_id) throw new ApiError(404, "Cart id not found");

    const { product_id, inventory_id } = req.body as CartItem & {
      cart_id: string;
    };

    if (!cart_id || !product_id || !inventory_id)
      throw new ApiError(
        400,
        "cart_id, product_id and inventory_id are required"
      );

    const cart = await cartServices.removeItem(cart_id, {
      product_id,
      inventory_id,
    });

    return res
      .status(200)
      .json({ success: true, message: "product removed from cart", cart });
  }),

  updateCartItem: asyncHandler(
    async (req: RequestWithUser, res: Response, next: NextFunction) => {
      const { action } = req.query;

      switch (action) {
        case "increase":
          await updateController.increaseQuantity(req, res, next);
          break;

        case "decrease":
          await updateController.decreaseQuantity(req, res, next);
          break;

        case "update-quantity":
          await updateController.updateQuantity(req, res, next);
          break;

        default:
          throw new ApiError(400, "Invalid cart action");
      }
    }
  ),

  delete: asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { id: cart_id } = req.params as { id: string };
    if (!cart_id) throw new ApiError(400, "cart_id is required");

    await cartServices.remove(cart_id);

    return res.status(201).json({ success: true, message: "cart deleted" });
  }),
};

const updateController = {
  increaseQuantity: asyncHandler(
    async (req: RequestWithUser, res: Response) => {
      const cart_id = req.cookies.cart_id;
      if (!cart_id) throw new ApiError(404, "Cart id not found");
      
      const { product_id, inventory_id } = req.body as CartItem;

      if ( !product_id || !inventory_id)
        throw new ApiError(
          400,
          "product_id and inventory_id are required"
        );

      const cart = await cartServices.increaseQuantity({
        cart_id,
        product_id,
        inventory_id,
      });

      return res
        .status(200)
        .json({ success: true, message: "quantity increased", cart });
    }
  ),

  decreaseQuantity: asyncHandler(
    async (req: RequestWithUser, res: Response) => {
      const cart_id = req.cookies.cart_id;
      if (!cart_id) throw new ApiError(404, "Cart id not found");

      const {  product_id, inventory_id } = req.body as CartItem;

      if (!product_id || !inventory_id)
        throw new ApiError(
          400,
          " product_id and inventory_id are required"
        );

      const cart = await cartServices.decreaseQuantity({
        cart_id,
        product_id,
        inventory_id,
      });

      return res
        .status(200)
        .json({ success: true, message: "quantity decreased", cart });
    }
  ),

  updateQuantity: asyncHandler(async (req: RequestWithUser, res: Response) => {
    const cart_id = req.cookies.cart_id;
    if (!cart_id) throw new ApiError(404, "Cart id not found");
    const { product_id, inventory_id, quantity } =
      req.body as CartItem & {
        quantity: number;
      };

    if (quantity < 1) throw new ApiError(400, "Minimum 1 product required");

    if ( !product_id || !inventory_id)
      throw new ApiError(400, " product_id, inventory_id are required");

    const cart = await cartServices.updateQuantity({
      cart_id,
      product_id,
      inventory_id,
      quantity,
    });

    return res
      .status(200)
      .json({ success: true, message: "quantity updated", cart });
  }),
};

export const setCartIdToCookie = (res: Response, cart_id: string) => {
  res.cookie("cart_id", cart_id, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });
};
