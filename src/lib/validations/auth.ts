import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const userProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type UserProfileInput = z.infer<typeof userProfileSchema>;
