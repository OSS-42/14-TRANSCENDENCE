import Cookies from "js-cookie";

export const getCookies = (key: string) => {
  const token = Cookies.get(key);
  if (!token || token === undefined) {
    return "";
  }
  return token;
};

export const bearerAuthorization = (token: string) => {
  return token ? `Bearer ${token}` : "";
};
