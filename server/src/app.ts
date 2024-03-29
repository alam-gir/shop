import express, { Request, Response } from "express";
import env from "dotenv";
import prisma from "./lib/prisma";

import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/products.routes";
import errorController from "./controllers/error/error.controller";
import categoryRoutes from "./routes/category.routes";
import cartRoutes from "./routes/cart.routes";
import heroSLiderImageRoutes from "./routes/hero-slider-images.routes";
import shippingRoutes from "./routes/shipping.routes";
import orderRoutes from "./routes/order.routes";
import discountRoutes from "./routes/discount.routes";
import couponRoutes from "./routes/coupon.routes";

import NodeCache from "node-cache";
import cookieParser from "cookie-parser";

env.config({ path: ".env" });

export const cache = new NodeCache();

const app = express();

//----------------- middlewares -------------------
app.use(cookieParser());
app.use(express.json());

app.get("/", async (req: Request, res: Response) => {
  try {
    // console.log(
    //   await prisma.heroSliderImages.delete({
    //     where: { id: "819de002-ddee-43f1-b44b-1824f047b5d8" },
    //   })
    // );
    return res.send("Running...");
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Server Error");
  }
});

//------------ routes ---------------
// auth
app.use("/v1/auth", authRoutes);

//user
app.use("/v1/users", userRoutes);

// product
app.use("/v1/categories", categoryRoutes);

// product
app.use("/v1/products", productRoutes);

// cart
app.use("/v1/cart", cartRoutes);

// hero slider images
app.use("/v1/hero-slider-images", heroSLiderImageRoutes);

// shipping
app.use("/v1/shipping", shippingRoutes);

// order
app.use("/v1/orders", orderRoutes);

// discount
app.use("/v1/discounts", discountRoutes);

// coupon
app.use("/v1/coupons", couponRoutes);

//------------ error handle route ---------------
app.use(errorController);

export default app;
