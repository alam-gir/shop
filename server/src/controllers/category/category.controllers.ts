import { Request, Response } from "express";
import asyncHandler from "../../lib/async-handler";
import { ApiError } from "../../lib/api-response-custom";
import { categoryServices } from "../../lib/db-services/category.services";
import { cache } from "./../../app";

export const categoryControllers = {
  create: asyncHandler(async (req: Request, res: Response) => {
    try {
      const files = req.files as unknown as {
        banner: Express.Multer.File[] | undefined;
        icon: Express.Multer.File[] | undefined;
      };
      const banner = files.banner ? files.banner[0] : undefined;
      const icon = files.icon ? files.icon[0] : undefined;

      const { name } = req.body as { name: string };
      if (!name) throw new ApiError(400, "Category name is required!");

      const isExist = await categoryServices.getByname(name);

      if (isExist) throw new ApiError(400, "Category already exist!");

      const category = await categoryServices.create({ name, banner, icon });

      //remove category tree from cache
      cache.del("categoryFullTree");
      // cache.del(`categoryTree-${category.id}`);

      return res.status(200).json({
        success: true,
        message: "category created!",
        category: category,
      });
    } catch (error) {
      throw error;
    }
  }),
  createSub: asyncHandler(async (req: Request, res: Response) => {
    try {
      const files = req.files as unknown as {
        banner: Express.Multer.File[] | undefined;
        icon: Express.Multer.File[] | undefined;
      };
      const banner = files.banner ? files.banner[0] : undefined;
      const icon = files.icon ? files.icon[0] : undefined;
      
      const { id: parentId } = req.params;
      const { name } = req.body as { name: string };

      if (!name) throw new ApiError(400, "Category name is required!");

      const isExist = await categoryServices.getByname(name);

      if (isExist) throw new ApiError(400, "Category already exist!");

      const category = await categoryServices.createSubCategory({
        name,
        parentId,
        icon,
        banner,
      });

      //remove category tree from cache
      cache.del("categoryFullTree");
      cache.del(`categoryTree-${category.id}`);

      return res.status(200).json({
        success: true,
        message: "category created!",
        category: category,
      });
    } catch (error) {
      throw error;
    }
  }),

  getAll: asyncHandler(async (req: Request, res: Response) => {
    try {
    } catch (error) {
      throw error;
    }
  }),

  getFullTree: asyncHandler(async (req: Request, res: Response) => {
    try {
      let categoryFullTree = cache.get("categoryFullTree");

      if (!categoryFullTree) {
        categoryFullTree = await categoryServices.getFullTree();
        cache.set("categoryFullTree", categoryFullTree);
      }

      if (!categoryFullTree) throw new ApiError(404, "Categories not found");

      return res.status(200).json({ categoryFullTree });
    } catch (error) {
      throw error;
    }
  }),

  getTree: asyncHandler(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) throw new ApiError(400, "Category id is required");

      let categoryTree = cache.get(`categoryTree-${id}`);

      if (!categoryTree) {
        categoryTree = await categoryServices.getTree(id);
        cache.set(`categoryTree-${id}`, categoryTree);
      }

      if (!categoryTree) throw new ApiError(404, "Category not found");

      return res.status(200).json({ categoryTree });
    } catch (error) {
      throw error;
    }
  }),

  getSingle: asyncHandler(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { children } = req.query;

      const category = await categoryServices.getById(id, {
        children: children === "true",
      });

      return res.status(200).json({ category });
    } catch (error) {
      throw error;
    }
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;
    const banner = req.file;

    const updatedCategory = await categoryServices.update({
      categoryId: id,
      name,
      banner,
    });

    //remove category tree from cache
    cache.del("categoryFullTree");
    cache.del(`categoryTree-${updatedCategory.id}`);

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory,
    });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const removedCategory = await categoryServices.remove(id);

      //remove category tree from cache
      cache.del("categoryFullTree");
      cache.del(`categoryTree-${id}`);

      return res.status(200).json({
        message: "Category deleted successfully",
        success: true,
        category: removedCategory,
      });
    } catch (error) {
      throw error;
    }
  }),
};
