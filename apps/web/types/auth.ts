import { AdminUser } from "@/lib/auth";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  user: AdminUser;
};
