import { z } from "zod";

export const SignInFormSchema = z.object({
  identifier: z
    .string()
    .min(3, {
      message: "Username or email must be at least 3 characters",
    })
    .max(255, {
      message: "Username or email must be at most 255 characters",
    })
    .trim(),
  password: z
    .string()
    .min(6, {
      message: "Password must be at least 6 characters",
    })
    .max(255, {
      message: "Password must be at most 255 characters",
    }),
});

export const SignUpFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  fullName: z.string().min(1, "Full name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  passwordConfirm: z.string(),
  userName: z.string().min(3, "Username must be at least 3 characters"),
});

export type SignInFormValues = z.infer<typeof SignInFormSchema>;
export type SignUpFormValues = z.infer<typeof SignUpFormSchema>;
