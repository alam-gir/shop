import { providers } from "./get-auth-url";

export const getUserInfo = async ({
  access_token,
  provider,
}: {
  access_token: string;
  provider: string;
}) => {
  switch (provider) {
    case "google":
      return await providers.google.getUserInfo(access_token);
    case "facebook":
      return await providers.facebook.getUserInfo(access_token);
    case "github":
      return await providers.github.getUserInfo(access_token);
    default:
      return null;
  }
};
