import { ApiError } from "../api-response-custom";
import { mailServices } from "./mail.services";

export const sendOrderEmail = async ({status, orderId}:{status: string, orderId: string}) => {
    if(!status) throw new ApiError(400, "Invalid status");
    if(!orderId) throw new ApiError(400, "Order not found");

    switch (status) {
        case "processing":
            await mailServices.orderConfirmed({ orderId});
          break;
  
        case "shipping":
            await mailServices.orderShipping({ orderId});
          break;
  
        case "shipped":
            await mailServices.orderShipped({ orderId});
          break;
  
        case "hold":
          break;
  
        case "unHold":
          break;
  
        case "complete":
            await mailServices.orderComplete({ orderId});
          break;
  
        case "return":
          break;
  
        case "cancel":
          break;
  
        default:
          break;
      }
}