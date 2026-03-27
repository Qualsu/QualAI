import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API;

if (!baseURL) {
  throw new Error("NEXT_PUBLIC_API is not defined");
}

export const apiClient = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});
