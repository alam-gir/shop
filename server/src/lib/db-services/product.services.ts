import { Discount, PRODUCTSTATUS, Prisma, Product } from "@prisma/client";
import prisma from "../../lib/prisma";
import { ApiError } from "../api-response-custom";
import { removeFromCloudinary, uploadPromises } from "../cloudinary";
import { GetProductsProps } from "../../types/types";
import { discountServices } from "./discount.services";

type Inventory = {
  quantity: number;
  attributes: { ["name"]: string; ["value"]: string }[];
};

export const productServices = {
  create: async ({
    name,
    category_id,
  }: {
    name: string;
    category_id: string;
  }) => {
    try {
      if (!name || !category_id)
        throw new ApiError(400, "Name and category_id are required!");
      return await prisma.$transaction([
        prisma.product.create({
          data: {
            name,
            category: {
              connect: {
                id: category_id,
              },
            },
          },
          include: { category: true },
        }),
      ]);
    } catch (error) {
      throw error;
    }
  },

  remove: async (id: string) => {
    return await prisma.product.delete({ where: { id } });
  },

  getById: async (id: string, options?: GetProductsProps) => {
    try {
      const { where, include } = getProductFilterOptions(options);

      const product = await prisma.product.findUnique({
        where: { id, AND: where.AND },
        include,
      });

      if (product) return await getDiscountedProduct(product);
      return product;
    } catch (error) {
      throw error;
    }
  },

  getAll: async (options?: GetProductsProps) => {
    const { where, include, orderBy } = getProductFilterOptions(options);

    let baseProducts = await prisma.product.findMany({
      where,
      include,
      orderBy,
      take: options?.take,
      skip: options?.skip,
    });

    const discountedProductPromises = baseProducts?.map((product) => {
      return getDiscountedProduct(product);
    });

    const totalProductsPromise = prisma.product.count({
      where,
    });

    const [totalProducts, ...discountedProducts] = await Promise.all([
      totalProductsPromise,
      ...discountedProductPromises,
    ]);

    return {
      currentPage: options?.skip! + 1,
      totalProducts,
      products: discountedProducts,
    };
  },

  update: {
    name: async ({
      product_id,
      name,
    }: {
      product_id: string;
      name: string;
    }) => {
      try {
        if (!name) throw new ApiError(400, "Name is required");
        if (!product_id) throw new ApiError(400, "Product id is required");
        return await prisma.product.update({
          where: { id: product_id },
          data: { name },
        });
      } catch (error) {
        throw error;
      }
    },

    brand: async ({
      product_id,
      brand,
    }: {
      product_id: string;
      brand: string;
    }) => {
      try {
        if (!brand) throw new ApiError(400, "Brand is required");
        if (!product_id) throw new ApiError(400, "Product id is required");
        return await prisma.product.update({
          where: { id: product_id },
          data: { brand },
        });
      } catch (error) {
        throw error;
      }
    },

    model: async ({
      product_id,
      model,
    }: {
      product_id: string;
      model: string;
    }) => {
      try {
        if (!model) throw new ApiError(400, "Model is required");
        if (!product_id) throw new ApiError(400, "Product id is required");
        return await prisma.product.update({
          where: { id: product_id },
          data: { model },
        });
      } catch (error) {
        throw error;
      }
    },

    tags: async ({
      product_id,
      tags,
    }: {
      product_id: string;
      tags: string[];
    }) => {
      try {
        if (!tags.length) throw new ApiError(400, "Tag is required");
        if (!product_id) throw new ApiError(400, "Product id is required");

        return await prisma.product.update({
          where: { id: product_id },
          data: {
            tags,
          },
        });
      } catch (error) {
        throw error;
      }
    },

    status: async ({
      product_id,
      status,
    }: {
      product_id: string;
      status: string;
    }) => {
      try {
        if (!status) throw new ApiError(400, "Status is required");

        return await prisma.product.update({
          where: { id: product_id },
          data: { status: status as PRODUCTSTATUS },
        });
      } catch (error) {
        throw error;
      }
    },

    description: async ({
      product_id,
      description,
    }: {
      product_id: string;
      description: string;
    }) => {
      try {
        if (!description) throw new ApiError(400, "Description is required");
        if (!product_id) throw new ApiError(400, "Product id is required");
        return await prisma.product.update({
          where: { id: product_id },
          data: { description },
        });
      } catch (error) {
        throw error;
      }
    },

    slug: async ({
      product_id,
      slug,
    }: {
      product_id: string;
      slug: string;
    }) => {
      try {
        if (!slug) throw new ApiError(400, "Slug is required");
        if (!product_id) throw new ApiError(400, "Product id is required");
        return await prisma.product.update({
          where: { id: product_id },
          data: { slug },
        });
      } catch (error) {
        throw error;
      }
    },

    price: async ({
      product_id,
      price,
    }: {
      product_id: string;
      price: number;
    }) => {
      try {
        if (!price) throw new ApiError(400, "Price is required");
        if (!product_id) throw new ApiError(400, "Product id is required");
        return await prisma.product.update({
          where: { id: product_id },
          data: { price, subTotalPrice: price },
        });
      } catch (error) {
        throw error;
      }
    },

    category: async ({
      product_id,
      category_id,
    }: {
      product_id: string;
      category_id: string;
    }) => {
      try {
        if (!category_id) throw new ApiError(400, "Category ids are required");
        if (!product_id) throw new ApiError(400, "Product id is required");

        return await prisma.product.update({
          where: { id: product_id },
          data: {
            category: {
              connect: {
                id: category_id,
              },
            },
          },
        });
      } catch (error) {
        throw error;
      }
    },
  },

  inventory: {
    /**
     * initialze a empty inventory for a product
     */
    create: async ({ product_id }: { product_id: string }) => {
      try {
        const updatedProduct = await prisma.product.update({
          where: { id: product_id },
          data: {
            inventory: {
              create: {
                quantity: 0,
              },
            },
          },
          include: { inventory: true },
        });

        return updatedProduct;
      } catch (error) {
        throw error;
      }
    },

    /**
     * add inventory data to existing inventory // it wll need when we clone the inventory
     */
    add: async ({
      product_id,
      inventory,
    }: {
      product_id: string;
      inventory: Inventory;
    }) => {
      try {
        if (!product_id) throw new ApiError(400, "Product id is required");

        const attributesData = inventory.attributes.map((attribute) => ({
          attribute: {
            create: {
              name: attribute.name,
              value: attribute.value,
            },
          },
        }));

        return await prisma.product.update({
          where: { id: product_id },
          data: {
            inventory: {
              create: [
                {
                  quantity: inventory.quantity,
                  attributes: {
                    create: attributesData,
                  },
                },
              ],
            },
          },
        });
      } catch (error) {
        throw error;
      }
    },

    get: async (inventory_id: string) => {
      try {
        if (!inventory_id) throw new ApiError(400, "Inventory id is required");
        return await prisma.inventory.findUnique({
          where: { id: inventory_id },
          include: { attributes: { include: { attribute: true } } },
        });
      } catch (error) {
        throw error;
      }
    },

    clone: async ({ inventory_id }: { inventory_id: string }) => {
      try {
        if (!inventory_id) throw new ApiError(400, "Inventory id is required");
        const inventory = await productServices.inventory.get(inventory_id);

        const attributes = inventory?.attributes?.map((attr) => {
          return {
            name: attr.attribute.name,
            value: attr.attribute.value,
          };
        });

        const newInventory: Inventory = {
          quantity: inventory?.quantity!,
          attributes: attributes!,
        };

        const clonedInvetory = await productServices.inventory.add({
          product_id: inventory?.productId!,
          inventory: newInventory,
        });

        return clonedInvetory;
      } catch (error) {
        throw error;
      }
    },

    remove: async ({
      product_id,
      inventory_id,
    }: {
      product_id: string;
      inventory_id: string;
    }) => {
      try {
        if (!inventory_id)
          throw new ApiError(400, "Product inventory id is required");

        const deletedInventory = await prisma.inventory.delete({
          where: { id: inventory_id },
        });
        console.log({ deletedInventory });
        return deletedInventory;
      } catch (error) {
        throw error;
      }
    },

    update: {
      qunatity: async ({
        inventory_id,
        quantity,
      }: {
        inventory_id: string;
        quantity: number;
      }) => {
        try {
          if (!quantity) throw new ApiError(400, "Quantity is required");
          if (quantity < 0)
            throw new ApiError(400, "Quantity must be positive");

          return await prisma.inventory.update({
            where: { id: inventory_id },
            data: {
              quantity,
            },
          });
        } catch (error) {
          throw error;
        }
      },

      decreaseQuantity: async ({
        inventory_id,
        quantity,
      }: {
        inventory_id: string;
        quantity: number;
      }) => {
        try {
          if (!quantity) throw new ApiError(400, "Quantity is required");

          return await prisma.inventory.update({
            where: { id: inventory_id },
            data: {
              quantity: { decrement: quantity },
            },
          });
        } catch (error) {
          throw error;
        }
      },

      increaseQuantity: async ({
        inventory_id,
        quantity,
      }: {
        inventory_id: string;
        quantity: number;
      }) => {
        try {
          if (!quantity) throw new ApiError(400, "Quantity is required");

          return await prisma.inventory.update({
            where: { id: inventory_id },
            data: {
              quantity: { increment: quantity },
            },
          });
        } catch (error) {
          throw error;
        }
      },
    },
    attribute: {
      add: async ({
        inventory_id,
        attribute,
      }: {
        inventory_id: string;
        attribute: { name: string; value: string };
      }) => {
        try {
          if (!inventory_id)
            throw new ApiError(400, "Inventory id is required");
          if (!attribute.name || !attribute.value)
            throw new ApiError(400, "Attribute name and value are required");

          const updatedInventory = await prisma.inventory.update({
            where: { id: inventory_id },
            data: {
              attributes: {
                create: [
                  {
                    attribute: {
                      create: attribute,
                    },
                  },
                ],
              },
            },
            include: { attributes: { include: { attribute: true } } },
          });

          return updatedInventory;
        } catch (error) {
          throw error;
        }
      },

      update: async ({
        inventory_id,
        attribute_id,
        newAttribute,
      }: {
        inventory_id: string;
        attribute_id: string;
        newAttribute: { name: string; value: string };
      }) => {
        try {
          if (!inventory_id)
            throw new ApiError(400, "Inventory id is required");
          if (!attribute_id)
            throw new ApiError(400, "Attribute id is required");
          if (!newAttribute.name || !newAttribute.value)
            throw new ApiError(400, "Attribute name and value are required");

          const updatedInventory = await prisma.attributesOnInventory.update({
            where: {
              inventoryId_attributeId: {
                inventoryId: inventory_id,
                attributeId: attribute_id,
              },
            },
            data: {
              attribute: {
                update: newAttribute,
              },
            },
            include: { attribute: true },
          });

          return updatedInventory;
        } catch (error) {
          throw error;
        }
      },

      remove: async ({
        inventory_id,
        attribute_id,
      }: {
        attribute_id: string;
        inventory_id: string;
      }) => {
        try {
          if (!attribute_id)
            throw new ApiError(400, "Attribute id is required");
          const deletedAttribute = await prisma.attributesOnInventory.delete({
            where: {
              inventoryId_attributeId: {
                attributeId: attribute_id,
                inventoryId: inventory_id,
              },
            },
            include: { attribute: true },
          });

          return deletedAttribute;
        } catch (error) {
          throw error;
        }
      },
    },
  },

  image: {
    add: async ({
      product_id,
      images,
    }: {
      product_id: string;
      images: Express.Multer.File[];
    }) => {
      try {
        const uploadedImages = await Promise.all(
          uploadPromises({
            files: images,
            folder: process.env.PRODUCT_IMAGE_FOLDER as string,
            progressEventName: "product-images-upload-progress",
          })
        );

        const uploaded = uploadedImages.map((item) => {
          if (!item)
            throw new ApiError(400, "failed to upload image : " + item);
          return { url: item.secure_url, public_id: item.public_id };
        });

        const productImages = await prisma.$transaction([
          prisma.product.update({
            where: { id: product_id },
            data: {
              images: {
                create: uploaded,
              },
            },
            include: { images: true },
          }),
        ]);

        return productImages;
      } catch (error) {
        throw error;
      }
    },

    remove: async ({ image_id }: { image_id: string }) => {
      try {
        if (!image_id) throw new ApiError(400, "image id required!");
        // remove from db
        const deletedFromDb = await prisma.image.delete({
          where: { id: image_id },
        });
        if (!deletedFromDb)
          throw new ApiError(400, "failed to delete image from db!");
        // remove from cloudinary
        const deletedFromCloudinary = await removeFromCloudinary(
          deletedFromDb.public_id
        );

        console.log({ deletedFromCloudinary });
        return deletedFromDb;
      } catch (error) {
        console.log({ error });
        throw error;
      }
    },
  },
};

const getProductFilterOptions = (options?: GetProductsProps) => {
  const where: Prisma.ProductWhereInput = {
    AND: [
      {
        OR: [
          options?.include
            ? {
                name: {
                  contains: options?.include,
                  mode: "insensitive",
                },
              }
            : {},
          options?.include
            ? {
                tags: {
                  hasSome: options?.include.toLowerCase().split(" "),
                },
              }
            : {},
        ],
      },
      options?.brand
        ? {
            brand: {
              equals: options?.brand.toLowerCase(),
            },
          }
        : {},
      options?.category_id
        ? {
            category: {
              id: options?.category_id,
            },
          }
        : {},
    ],
  };

  const include: Prisma.ProductInclude = {
    category: options?.category
      ? {
          include: { childrens: options?.categoryChildren ? true : false },
        }
      : false,
    images: options?.images ? true : false,
    discount: options?.discount ? true : false,
    inventory: options?.inventory
      ? {
          include: {
            attributes: {
              include: {
                attribute: true,
              },
            },
          },
        }
      : false,
  };

  const orderBy = options?.sortBy
    ? { [options?.sortBy]: options?.sortType ? options?.sortType : "asc" }
    : {};

  return {
    where,
    include,
    orderBy,
  };
};

const getDiscountedProduct = async (
  product: Product & { discount: Discount | null }
) => {
  if (!product) return product;

  let discount = await discountServices.findProductDiscount(product.id);
  if (!discount) return product;

  product.discount = discount;

  const percentage = discount?.percentage;
  const amount = discount?.amount;

  if (percentage && !amount) {
    product.subTotalPrice = Math.floor(
      product.price! - (product.price! * percentage) / 100
    );
  }
  if (amount && !percentage) {
    product.subTotalPrice = product.price! - amount;
  }

  // if product goes under 0 price then remove the discount
  if (product.subTotalPrice! <= 0) {
    product.subTotalPrice = product.price!;
    product.discount = null;
  }

  return product;
};
