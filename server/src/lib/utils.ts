import { ApiError } from "./api-response-custom";

type Fields = {
  [key: string]: string;
};
export const requiredFeids = async (fields: Fields) => {
  const array = Object.entries(fields)

  for (const [key, value] of array) {
    if (!value) throw new ApiError(400, `${key} is required`);
  }
};

export const getPaginationOptions = ({
  page,
  limit,
}: {
  page: string | undefined;
  limit: string | undefined;
}) => {
  const take = limit ? parseInt(limit) : 10;
  const skip = page ? (parseInt(page as string) - 1) * take : 0;

  return {
    take,
    skip,
  };
};
