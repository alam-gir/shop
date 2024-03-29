import { Request, Response } from "express";
import { RequestWithUser } from "../../../@types/custom";
import asyncHandler from "../../lib/async-handler";
import { categoryServices } from "../../lib/db-services/category.services";
import { ApiError } from "../../lib/api-response-custom";
import { productServices } from "../../lib/db-services/product.services";
import { GetProductsProps } from "../../types/types";

export const productControllers = {
  create: asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { name, category_id } = req.body as {
      name: string;
      category_id: string;
    };

    if (!name || !category_id)
      return res
        .status(400)
        .json({ message: "Name and category_id are required!" });

    const product = await productServices.create({ name, category_id });

    return res.status(200).json({
      success: true,
      message: "product created!",
      product: product,
    });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) throw new ApiError(400, "Product id is required!");

    const deletedProduct = await productServices.remove(id);

    return res.status(200).json({ success: true, deletedProduct });
  }),

  getAll: asyncHandler(
    async (req: Request<{}, {}, {}, GetProductsProps>, res: Response) => {
      const {
        include,
        sortBy,
        sortType,
        category,
        categoryChildren,
        discount,
        images,
        brand,
        inventory,
        category_id,
        page,
        limit,
      } = req.query;

      const take = limit ? parseInt(limit) : 10;
      const skip = page ? (parseInt(page as string) - 1) * take : 0;

      const products = await productServices.getAll({
        skip,
        take,
        include,
        brand,
        sortBy,
        sortType,
        category_id,
        category: category === "true" ? true : false,
        categoryChildren: categoryChildren === "true" ? true : false,
        inventory: inventory === "true" ? true : false,
        images: images === "true" ? true : false,
        discount: discount === "true" ? true : false,
      });

      if (!products) throw new ApiError(404, "Products not found");

      return res.status(200).json({ data: products });
    }
  ),

  getSignle: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) throw new ApiError(400, "Product id is required");

    const { category, categoryChildren, discount, images, inventory } =
      req.query;

    const product = await productServices.getById(id, {
      category: category === "true" ? true : false,
      categoryChildren: categoryChildren === "true" ? true : false,
      inventory: inventory === "true" ? true : false,
      images: images === "true" ? true : false,
      discount: discount === "true" ? true : false,
    });

    return res.status(200).json({ product });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    try {
      const { type } = req.query;
      const {
        name,
        brand,
        model,
        tags,
        category_id,
        description,
        price,
        status,
        slug,
      } = req.body;

      const { id: product_id } = req.params;
      if (!product_id) throw new ApiError(400, "Product id is required");

      let result: any;

      switch (type) {
        case "name":
          result = await productServices.update.name({ product_id, name });
          break;

        case "model":
          result = await productServices.update.model({ product_id, model });
          break;

        case "brand":
          result = await productServices.update.brand({ product_id, brand });
          break;

        case "tags":
          result = await productServices.update.tags({ product_id, tags });
          break;

        case "description":
          result = await productServices.update.description({
            product_id,
            description,
          });
          break;

        case "slug":
          result = await productServices.update.slug({
            product_id,
            slug,
          });
          break;

        case "price":
          result = await productServices.update.price({ product_id, price });
          break;

        case "status":
          result = await productServices.update.status({ product_id, status });
          break;

        case "category":
          result = await productServices.update.category({
            product_id,
            category_id,
          });
          break;

        case "images":
          result = await updateProductImages({ request: req, product_id });
          break;

        case "inventory":
          result = await updateProductInventory({ request: req, product_id });
          break;
        default:
          throw new ApiError(400, "Invalid type");
      }

      if (!result) throw new ApiError(500, `Failed to update product ${type}`);

      res.status(200).json({
        message: `Product ${type} updated`,
        success: true,
        product: result,
      });
    } catch (error) {
      throw error;
    }
  }),
};

export const updateProductImages = async ({
  request,
  product_id,
}: {
  request: Request;
  product_id: string;
}) => {
  try {
    const { action } = request.query;
    switch (action) {
      case "add":
        return await productServices.image.add({
          product_id,
          images: request.files as Express.Multer.File[],
        });
      case "remove":
        return await productServices.image.remove({
          image_id: request.body.image_id,
        });
      default:
        throw new ApiError(400, "Invalid action");
    }
  } catch (error) {
    throw error;
  }
};

export const updateProductInventory = async ({
  request,
  product_id,
}: {
  request: Request;
  product_id: string;
}) => {
  try {
    const { action } = request.query;
    if (!action) throw new ApiError(400, "Action is required");

    const { inventory_id, attribute_id, attribute } = request.body;

    switch (action) {
      case "create":
        return await productServices.inventory.create({ product_id });

      case "remove":
        return await productServices.inventory.remove({
          product_id,
          inventory_id,
        });

      case "quantity":
        return await productServices.inventory.update.qunatity({
          inventory_id,
          quantity: request.body.quantity,
        });

      case "add-attribute":
        return await productServices.inventory.attribute.add({
          inventory_id,
          attribute: request.body.attribute,
        });

      case "update-attribute":
        return await productServices.inventory.attribute.update({
          inventory_id,
          attribute_id,
          newAttribute: attribute,
        });

      case "remove-attribute":
        return await productServices.inventory.attribute.remove({
          inventory_id,
          attribute_id,
        });

      case "clone":
        return await productServices.inventory.clone({
          inventory_id,
        });

      default:
        throw new ApiError(400, "Invalid action");
    }
  } catch (error) {
    throw error;
  }
};
