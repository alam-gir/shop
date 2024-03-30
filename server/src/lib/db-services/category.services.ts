import { ApiError } from "../api-response-custom";
import prisma from "../../lib/prisma";
import { removeFromCloudinary, uploadPromise } from "../../lib/cloudinary";
import { Category, Discount, Product } from "@prisma/client";

type GetOptions = {
  discount?: boolean;
  parent?: boolean;
  products?: boolean;
  children?: boolean;
};

export const categoryServices = {
  create: async ({
    name,
    banner,
    icon,
  }: {
    name: string;
    banner: Express.Multer.File | undefined;
    icon: Express.Multer.File | undefined;
  }) => {
    try {
      if (!name) throw new ApiError(400, "Category name is required!");

      const bannerDetailsPromise = uploadCategoryBanner(banner);
      const iconDetailsPromise = uploadCategoryIcon(icon);

      const [bannerDetails, iconDetails] = await Promise.all([
        bannerDetailsPromise,
        iconDetailsPromise,
      ]);

      return await prisma.category.create({
        data: {
          name,
          banner: bannerDetails.url,
          bannerPublic_id: bannerDetails.public_id,
          icon: iconDetails.url,
          iconPublic_id: iconDetails.public_id,
        },
      });
    } catch (error) {
      throw error;
    }
  },

  createSubCategory: async ({
    name,
    banner,
    icon,
    parentId,
  }: {
    name: string;
    banner: Express.Multer.File | undefined;
    icon: Express.Multer.File | undefined;
    parentId: string;
  }) => {
    try {
      if (!name) throw new ApiError(400, "Sub category name is required!");
      if (!parentId) throw new ApiError(400, "Parent category id is required!");

      const bannerDetailsPromise = uploadCategoryBanner(banner);
      const iconDetailsPromise = uploadCategoryIcon(icon);

      const [bannerDetails, iconDetails] = await Promise.all([
        bannerDetailsPromise,
        iconDetailsPromise,
      ]);

      return await prisma.category.create({
        data: {
          name,
          banner: bannerDetails.url,
          bannerPublic_id: bannerDetails.public_id,
          icon: iconDetails.url,
          iconPublic_id: iconDetails.public_id,
          parent: {
            connect: { id: parentId },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  },

  getFullTree: async () => {
    try {
      const categories = await prisma.category.findMany({
        where: { parentId: null },
        include: { childrens: true, discount: true },
      });

      const fullTree: any[] = [];
      for (let category of categories) {
        fullTree.push(await categoryServices.getTree(category.id));
      }
      return fullTree;
    } catch (error) {
      throw error;
    }
  },

  getTree: async (categoryId: string) => {
    try {
      if (!categoryId) throw new ApiError(400, "Category id is required!");

      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: {
          childrens: {
            include: {
              childrens: true,
              discount: true,
            },
          },
        },
      });

      if (!category) throw new ApiError(404, "Category not found!");

      for (let child of category.childrens) {
        const nestedChild = await categoryServices.getTree(child.id);
        child.childrens = nestedChild.childrens;
      }

      return category;
    } catch (error) {
      throw error;
    }
  },

  getById: async (categoryId: string, options?: GetOptions) => {
    try {
      if (!categoryId) throw new ApiError(400, "Category id is required!");

      const category = (await prisma.category.findUnique({
        where: { id: categoryId },
        include: {
          childrens: options?.children,
          products: options?.products,
          parent: options?.parent,
          discount: options?.discount,
        },
      })) as Category & {
        childrens: Category[] & { childrens: Category[] };
        products: Product[];
        parent: Category;
        discount: Discount;
      };
      return category;
    } catch (error) {
      throw error;
    }
  },

  update: async ({
    categoryId,
    name,
    banner,
    icon,
  }: {
    categoryId: string;
    name: string;
    banner?: Express.Multer.File;
    icon?: Express.Multer.File;
  }) => {
    try {
      if (!name) throw new ApiError(400, "Category name is required!");

      let category = await categoryServices.getById(categoryId);
      if (!category) throw new ApiError(404, "Category not found!");

      let updatedCategory: Category;

      if (banner || icon) {
        if (banner) {
          // upload new one,
          const uploadedBanner = await uploadCategoryBanner(banner);
          // remove prev
          if (category.bannerPublic_id) {
            await removeFromCloudinary(category.bannerPublic_id!);
          }
          // update
          updatedCategory = await prisma.category.update({
            where: { id: category.id },
            data: {
              name,
              banner: uploadedBanner.url,
              bannerPublic_id: uploadedBanner.public_id,
            },
          });
        }
        if (icon) {
          // upload new one,
          const uploadedIcon = await uploadCategoryIcon(banner);
          // remove prev
          if (category.iconPublic_id) {
            await removeFromCloudinary(category.bannerPublic_id!);
          }
          // update
          updatedCategory = await prisma.category.update({
            where: { id: category.id },
            data: {
              name,
              banner: uploadedIcon.url,
              bannerPublic_id: uploadedIcon.public_id,
            },
          });
        }
      }

      updatedCategory = await prisma.category.update({
        where: { id: categoryId },
        data: { name },
      });

      return updatedCategory;
    } catch (error) {
      throw error;
    }
  },

  getByname: async (name: string, options?: GetOptions) => {
    try {
      if (!name) throw new ApiError(400, "Category name is required!");

      return await prisma.category.findUnique({
        where: { name },
        include: {
          childrens: options?.children,
          products: options?.products,
          parent: options?.parent,
          discount: options?.discount,
        },
      });
    } catch (error) {
      throw error;
    }
  },

  remove: async (categoryId: string) => {
    try {
      if (!categoryId) throw new ApiError(400, "Category id is required!");
      const category = await categoryServices.getById(categoryId, {
        products: true,
        children: true,
      });

      if (category?.products?.length || category?.childrens?.length)
        throw new ApiError(
          400,
          "Category has products or sub caegory, cannot delete"
        );

      if (category.bannerPublic_id)
        await removeFromCloudinary(category.bannerPublic_id);
      if (category.iconPublic_id)
        await removeFromCloudinary(category.iconPublic_id);
      return await prisma.category.delete({ where: { id: categoryId } });
    } catch (error) {
      throw error;
    }
  },
};

const uploadCategoryBanner = async (banner?: Express.Multer.File) => {
  try {
    const bannerDetails = {
      public_id: "",
      url: "",
    };

    if (banner) {
      const uploadedBanner = await uploadPromise({
        file: banner,
        folder: process.env.CATEGORY_BANNER_FOLDER!,
        progressEventName: "category-banner-upload-progress",
      });

      bannerDetails.public_id = uploadedBanner.public_id;
      bannerDetails.url = uploadedBanner.secure_url;
    }

    return bannerDetails;
  } catch (error) {
    throw error;
  }
};

const uploadCategoryIcon = async (icon?: Express.Multer.File) => {
  try {
    const iconDetails = {
      public_id: "",
      url: "",
    };

    if (icon) {
      const uploadedIcon = await uploadPromise({
        file: icon,
        folder: process.env.CATEGORY_ICON_FOLDER!,
        progressEventName: "category-icon-upload-progress",
      });

      iconDetails.public_id = uploadedIcon.public_id;
      iconDetails.url = uploadedIcon.secure_url;
    }

    return iconDetails;
  } catch (error) {
    throw error;
  }
};
