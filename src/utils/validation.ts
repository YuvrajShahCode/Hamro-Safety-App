import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(3, "Enter your phone number or email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Enter your full name"),
    phone: z.string().min(7, "Enter a valid phone number"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const contactSchema = z.object({
  name: z.string().min(2, "Enter a name"),
  phone: z.string().min(7, "Enter a valid phone number"),
  relationship: z.string().min(2, "Enter a relationship"),
});
export type ContactFormValues = z.infer<typeof contactSchema>;

export const checkInSchema = z.object({
  destination: z.string().min(2, "Enter a destination"),
  expectedArrivalAt: z.string().min(1, "Select an expected arrival time"),
});
export type CheckInFormValues = z.infer<typeof checkInSchema>;
