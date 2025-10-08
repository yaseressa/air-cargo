export const objectMapper = (
  map: { [key: string]: any },
  key: string,
  value: string
) => {
  const transformedData = [];
  for (const k in map) {
    transformedData.push({ [key]: k, [value]: map[k] });
  }
  return transformedData;
};

export const transformIfMonth = (key: string): string => {
  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];
  return months.includes(key.toLowerCase()) ? key.slice(0, 3) : key;
};

export const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};

export const decodeJWT = (sub: string) => {
  const token = localStorage.getItem("token");
  if (token) {
    const payload = token.split(".")[1];
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload)[sub];
  }

  return null;
};

export const isEmpty = (str: string) => {
  return !!str && str.trim().length === 0;
};
