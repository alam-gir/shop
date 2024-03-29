import { ORDERSTATUS, PAYMENTMETHOD } from "@prisma/client";
import { Response } from "express";

export type CartItem = {
  product_id: string;
  inventory_id: string;
};

export type ShippingAddress = {
  name: string;
  phone: string;
  urgentPhone?: string;
  email: string;
  district: string;
  policeStation: string;
  address: string;
  note?: string;
};

export type PlaceOrderProp = {
  response?: Response;
  cart_id: string;
  shippingAddress: ShippingAddress;
  paymentInfo: {
    method: PAYMENTMETHOD;
    transactionId: string | undefined;
  };
  userId?: string;
};

export type GetOrderOptions = {
  orderCost?: boolean;
  status?: boolean;
  shippingAddress?: boolean;
  cart?: boolean;
  payment?: boolean;
  user?: boolean;
};

export type GetProductsProps = {
  include?: string;
  brand?: string;
  sortBy?: string;
  category_id?: string;
  images?: boolean | "true";
  discount?: boolean | "true";
  category?: boolean | "true";
  categoryChildren?: boolean | "true";
  inventory?: boolean | "true";
  sortType?: "asc" | "desc";
  page?: string;
  limit?: string;
  take?: number;
  skip?: number;
};

export type GetOrdersProps = {
  include?: string;
  statusText?: ORDERSTATUS;
  user_id?: string;
  phone?: string;
  subTotal?: string;
  sortBy?: string;
  sortType?: "asc" | "desc";
  cart?: boolean | "true";
  shippingAddress?: boolean | "true";
  orderCost?: boolean | "true";
  status?: boolean | "true";
  payment?: boolean | "true";
  user?: boolean | "true";
  page?: string;
  limit?: string;
  take?: number;
  skip?: number;
};

export type DiscountProps = {
  name?: string;
  description?: string;
  percentage?: number;
  amount?: number;
  uptoLimit?: number;
  minimumOrderAmount?: number;
  active?: boolean;
  startDate: Date;
  endDate: Date;
  subDiscount?: boolean;
  brands?: string[];
  product_ids?: string[];
  category_ids?: string[];
};

export type CouponProps = DiscountProps & {
  couponCode: string;
  limit?: number;
};
