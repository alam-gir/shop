import { ShippingAddress } from "../../types/types";
import ejs from "ejs";
import { sendMail } from "./nodemailer";
import path from "path";
import { orderServices } from "../db-services/order.services";

type OrderPlacedOptions = {
  shippingAddress: ShippingAddress;
  order: any;
  paymentInfo: any;
};

export const mailServices = {
  orderPlaced: async ({
    shippingAddress,
    order,
    paymentInfo,
  }: OrderPlacedOptions) => {
    const subject = {
      client: "An order placed at DECORHAT!",
      admin: "New Order Placed!",
    };

    const clientTemplatePath = path.join(
      __dirname,
      "../mail-Services/email-templates/orders/place-order-client.ejs"
    );
    const adminTemplatePath = path.join(
      __dirname,
      "../mail-Services/email-templates/orders/place-order-admin.ejs"
    );

    // to client
    const toClient = await ejs.renderFile(
      clientTemplatePath,
      { shippingAddress, order, paymentInfo },
      async (err, data) => {
        if (err) {
          console.log(err);
        } else {
          await sendMail({
            to: shippingAddress.email,
            subject: subject.client,
            html: data,
          });
        }
      }
    );
    // to admin
    const toAdmin = await ejs.renderFile(
      adminTemplatePath,
      { shippingAddress, order, paymentInfo },
      async (err, data) => {
        if (err) {
          console.log(err);
        } else {
          await sendMail({
            to: process.env.EMAIL_USER,
            subject: subject.client,
            html: data,
          });
        }
      }
    );
  },

  orderConfirmed: async ({ orderId }: { orderId: string }) => {
    const subject = "Order Confirmed!";

    const templatePath = path.join(
      __dirname,
      "../mail-Services/email-templates/orders/confirm-order-client.ejs"
    );

    const order = await orderServices.get(orderId, {
      cart: true,
      shippingAddress: true,
      payment: true,
    });

    const toClient = await ejs.renderFile(
      templatePath,
      {
        shippingAddress: order?.shippingAddress,
        order,
        paymentInfo: order?.payment,
      },
      async (err, data) => {
        if (err) {
          console.log(err);
        } else {
          await sendMail({
            to: order?.shippingAddress.email,
            subject: subject,
            html: data,
          });
        }
      }
    );
  },

  orderShipping: async ({ orderId }: { orderId: string }) => {
    const subject = "Order Shipping!";

    const templatePath = path.join(
      __dirname,
      "../mail-Services/email-templates/orders/shipping-order-client.ejs"
    );

    const order = await orderServices.get(orderId, {
      cart: true,
      shippingAddress: true,
      payment: true,
    });

    const toClient = await ejs.renderFile(
      templatePath,
      {
        shippingAddress: order?.shippingAddress,
        order,
        paymentInfo: order?.payment,
      },
      async (err, data) => {
        if (err) {
          console.log(err);
        } else {
          await sendMail({
            to: order?.shippingAddress.email,
            subject: subject,
            html: data,
          });
        }
      }
    );
  },

  orderShipped: async ({ orderId }: { orderId: string }) => {
    const subject = "Order Shipped!";

    const templatePath = path.join(
      __dirname,
      "../mail-Services/email-templates/orders/shipped-order-client.ejs"
    );

    const order = await orderServices.get(orderId, {
      cart: true,
      shippingAddress: true,
      payment: true,
    });

    const toClient = await ejs.renderFile(
      templatePath,
      {
        shippingAddress: order?.shippingAddress,
        order,
        paymentInfo: order?.payment,
      },
      async (err, data) => {
        if (err) {
          console.log(err);
        } else {
          await sendMail({
            to: order?.shippingAddress.email,
            subject: subject,
            html: data,
          });
        }
      }
    );
  },

  orderComplete: async ({ orderId }: { orderId: string }) => {
    const subject = "Order is delivered!";

    const templatePath = path.join(
      __dirname,
      "../mail-Services/email-templates/orders/complete-order.ejs"
    );

    const order = await orderServices.get(orderId, {
      cart: true,
      shippingAddress: true,
      payment: true,
    });

    const toClient = await ejs.renderFile(
      templatePath,
      {
        shippingAddress: order?.shippingAddress,
        order,
        paymentInfo: order?.payment,
      },
      async (err, data) => {
        if (err) {
          console.log(err);
        } else {
          await sendMail({
            to: order?.shippingAddress.email,
            subject: subject,
            html: data,
          });
        }
      }
    );
  },
};
