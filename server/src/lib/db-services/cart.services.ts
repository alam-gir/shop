import prisma from "../prisma";
import { ApiError } from "../api-response-custom";
import { userServices } from "./user.services";
import { productServices } from "./product.services";
import { CartItem } from "../../types/types";
import { Discount, Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { setCartIdToCookie } from "../../controllers/cart/cart.controllers";
import { discountServices } from "./discount.services";

type AddCartProps = {
  cartId?: string;
  userId?: string;
  cartItem: { productId: string; inventoryId: string };
};

const InventoryIncludeSet = Prisma.validator<Prisma.InventoryInclude>()({
  attributes: {
    select: {
      attribute: {
        select: { id: true, name: true, value: true },
      },
    },
  },
});

export const cartServices = {
  create: async (cartItem: CartItem) => {
    try {
      return await prisma.cart.create({
        data: {
          products: {
            create: [
              {
                quantity: 1,
                product: {
                  connect: { id: cartItem.product_id },
                },
                inventory: {
                  connect: { id: cartItem.inventory_id },
                },
              },
            ],
          },
        },
        include: { products: { include: { product: true } } },
      });
    } catch (error) {
      throw new ApiError(500, "Failed to create cart");
    }
  },

  createEmpty: async () => {
    try {
      return await prisma.cart.create({ data: {} });
    } catch (error) {
      throw error;
    }
  },

  get: async (id: string) => {
    try {
      const cart = await prisma.cart.findUnique({
        where: { id },
        include: {
          products: {
            include: {
              product: true,
              inventory: {
                include: {
                  attributes: {
                    include: { attribute: true },
                  },
                },
              },
            },
          },
        },
      });

      console.log(cart);

      const cartItemPromises = Array.from(cart?.products!).map(
        async (item: any) => {
          return productServices.getById(item.productId).then((product) => {
            const name = product?.name;
            const price = product?.price;
            const subTotalPrice = product?.subTotalPrice;
            const description = product?.description;
            const quantity = item.quantity;
            const inventory = item.inventory;
            const discount = product?.discount;

            const varient = Array.from(inventory?.attributes).map(
              (attribute: any) => {
                return {
                  [attribute.attribute.name]: attribute.attribute.value,
                };
              }
            );
            const data = {
              product_id: item.product.id,
              inventory_id: item.inventoryId,
              name,
              price,
              subTotalPrice,
              description: description,
              quantity,
              discount: discount ? discount : null,
              varient,
            };

            return data;
          });
        }
      );

      const [...cartItems] = await Promise.all(cartItemPromises);

      return {
        cart_id: cart?.id,
        products: cartItems,
      };
    } catch (error) {
      throw error;
    }
  },

  merge: async (from_cart_id: string, to_cart_id: string) => {
    try {
      if (!from_cart_id || !to_cart_id)
        throw new ApiError(400, "Both cart ids are required");

      const from_cart = await prisma.cart.findUnique({
        where: { id: from_cart_id },
        include: { products: true },
      });
      const to_cart = await prisma.cart.findUnique({
        where: { id: to_cart_id },
        include: { products: true },
      });

      const from_cart_items = Array.from(from_cart?.products!).map((item) => {
        return {
          productId: item.productId,
          inventoryId: item.inventoryId,
        };
      });

      const to_cart_items = Array.from(to_cart?.products!).map((item) => {
        return {
          productId: item.productId,
          inventoryId: item.inventoryId,
        };
      });

      const items_to_merge = from_cart_items.filter(
        (item) => !to_cart_items.includes(item)
      );

      const mergedCart = await prisma.$transaction([
        prisma.cart.update({
          where: { id: to_cart_id },
          data: {
            products: {
              create: items_to_merge.map((item) => item),
            },
          },
        }),
        prisma.cart.delete({ where: { id: from_cart_id } }),
      ]);

      return mergedCart;
    } catch (error) {
      throw error;
    }
  },

  remove: async (id: string) => {
    if (!id) throw new ApiError(400, "Cart id is required");
    return await prisma.cart.delete({
      where: { id },
      include: { products: true },
    });
  },

  getItem: async ({
    cart_id,
    product_id,
    inventory_id,
  }: {
    cart_id: string;
    product_id: string;
    inventory_id: string;
  }) => {
    try {
      return await prisma.productsOnCart.findUnique({
        where: {
          cartId_productId_inventoryId: {
            cartId: cart_id,
            productId: product_id,
            inventoryId: inventory_id,
          },
        },

        include: { product: true },
      });
    } catch (error) {
      throw error;
    }
  },

  addItem: async (cart_id: string, cartItem: CartItem) => {
    try {
      const productPromise = productServices.getById(cartItem.product_id);

      const itemPromise = cartServices.getItem({
        cart_id,
        product_id: cartItem.product_id,
        inventory_id: cartItem.inventory_id,
      });

      const [product, item] = await Promise.all([productPromise, itemPromise]);

      if (!product) throw new ApiError(400, "Product not found.");

      if (product?.status === "INACTIVE")
        throw new ApiError(400, "Product is not available.");

      if (item) {
        return await cartServices.increaseQuantity({
          cart_id,
          product_id: cartItem.product_id,
          inventory_id: cartItem.inventory_id,
        });
      } else {
        return await prisma.cart.update({
          where: { id: cart_id },
          data: {
            products: {
              create: [
                {
                  quantity: 1,
                  product: {
                    connect: { id: cartItem.product_id },
                  },
                  inventory: {
                    connect: { id: cartItem.inventory_id },
                  },
                },
              ],
            },
          },
          include: { products: { include: { product: true } } },
        });
      }
    } catch (error) {
      throw error;
    }
  },

  removeItem: async (cart_id: string, cartItem: CartItem) => {
    try {
      return await prisma.productsOnCart.delete({
        where: {
          cartId_productId_inventoryId: {
            cartId: cart_id,
            productId: cartItem.product_id,
            inventoryId: cartItem.inventory_id,
          },
        },
      });
    } catch (error) {
      throw error;
    }
  },

  changeCart: async (res: Response, userId: string | undefined) => {
    try {
      //create an empty cart
      const newCart = await cartServices.createEmpty();
      const newCartId = newCart.id;

      // if user then diconnect cart from user and connect new one
      if (userId) {
        await userServices.changeCart({ userId, newCartId });
      }

      // set new cart id to cookie
      setCartIdToCookie(res, newCartId);
    } catch (error) {
      throw error;
    }
  },

  clear: async (cart_id: string) => {
    try {
      const cart = await prisma.cart.findUnique({
        where: { id: cart_id },
        include: { products: true },
      });
      if (!cart) throw new ApiError(400, "Cart not found.");

      const itemDeletePromises = cart?.products?.map((item) => {
        return prisma.productsOnCart.delete({
          where: {
            cartId_productId_inventoryId: {
              cartId: cart.id!,
              productId: item.productId,
              inventoryId: item.inventoryId,
            },
          },
        });
      });

      const cleared = await prisma.$transaction(itemDeletePromises);
      return cleared;
    } catch (error) {
      throw error;
    }
  },

  increaseQuantity: async ({
    cart_id,
    product_id,
    inventory_id,
  }: {
    cart_id: string;
    product_id: string;
    inventory_id: string;
  }) => {
    try {
      const itemInventory = await prisma.inventory.findUnique({
        where: { id: inventory_id },
      });

      const item = await cartServices.getItem({
        cart_id,
        product_id,
        inventory_id,
      });

      if (itemInventory?.quantity === item?.quantity)
        throw new ApiError(
          400,
          `This product maximum can select ${itemInventory?.quantity} items.`
        );

      return await prisma.productsOnCart.update({
        where: {
          cartId_productId_inventoryId: {
            cartId: cart_id,
            productId: product_id,
            inventoryId: inventory_id,
          },
        },
        data: {
          quantity: {
            increment: 1,
          },
        },
        include: { product: true },
      });
    } catch (error) {
      throw error;
    }
  },

  decreaseQuantity: async ({
    cart_id,
    product_id,
    inventory_id,
  }: {
    cart_id: string;
    product_id: string;
    inventory_id: string;
  }) => {
    try {
      const item = await cartServices.getItem({
        cart_id,
        product_id,
        inventory_id,
      });

      if (item?.quantity === 1)
        throw new ApiError(400, "Minimum 1 product required.");

      return await prisma.productsOnCart.update({
        where: {
          cartId_productId_inventoryId: {
            cartId: cart_id,
            productId: product_id,
            inventoryId: inventory_id,
          },
        },
        data: {
          quantity: {
            decrement: 1,
          },
        },
        include: { product: true },
      });
    } catch (error) {
      throw error;
    }
  },

  updateQuantity: async ({
    cart_id,
    product_id,
    inventory_id,
    quantity,
  }: {
    cart_id: string;
    product_id: string;
    inventory_id: string;
    quantity: number;
  }) => {
    try {
      if (quantity < 1) throw new ApiError(400, "Minimum 1 product required.");

      const itemInventory = await prisma.inventory.findUnique({
        where: { id: inventory_id },
      });

      const item = await cartServices.getItem({
        cart_id,
        product_id,
        inventory_id,
      });

      if (itemInventory?.quantity! < quantity)
        throw new ApiError(
          400,
          `This product maximum can select ${itemInventory?.quantity} items.`
        );

      return await prisma.productsOnCart.update({
        where: {
          cartId_productId_inventoryId: {
            cartId: cart_id,
            productId: product_id,
            inventoryId: inventory_id,
          },
        },
        data: {
          quantity: {
            set: quantity,
          },
        },
        include: { product: true },
      });
    } catch (error) {
      throw error;
    }
  },
};

export const manageCartAtLogin = async (
  req: Request,
  res: Response,
  { user_cart_id }: { user_cart_id: string }
) => {
  try {
    const cart_id = req.cookies.cart_id;

    if (!cart_id) {
      setCartIdToCookie(res, user_cart_id);
      return;
    }

    if (cart_id === user_cart_id) return;

    await cartServices.merge(cart_id, user_cart_id);

    setCartIdToCookie(res, user_cart_id);
  } catch (error) {
    throw error;
  }
};
