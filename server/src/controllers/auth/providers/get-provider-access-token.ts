import { providers } from "./get-auth-url";

export const getAccessToken = async ({
  provider,
  code,
}: {
  provider: string;
  code: string;
}) => {
  switch (provider) {
    case "google":
      return await providers.google.getAccessToken({ code });
    case "facebook":
      return providers.facebook.getAccessToken({ code });
    case "github":
      return providers.github.getAccessToken({ code });
    default:
      return null;
  }
};
