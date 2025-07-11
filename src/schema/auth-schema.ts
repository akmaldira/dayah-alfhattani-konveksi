import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().min(1, "Email harus diisi").email(),
  password: z.string().min(6, "Password minimal 6 karakter"),
});
export type SignInSchema = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  email: z.string().min(1, "Email harus diisi").email(),
  password: z.string().min(6, "Password minimal 6 karakter"),
});
export type SignUpSchema = z.infer<typeof signUpSchema>;
