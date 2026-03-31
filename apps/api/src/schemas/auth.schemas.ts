import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(3, "Informe seu nome completo."),
    email: z.string().email("Email invalido."),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
    confirmPassword: z.string().min(8)
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas nao conferem.",
    path: ["confirmPassword"]
  });

export const loginSchema = z.object({
  email: z.string().email("Email invalido."),
  password: z.string().min(8, "Senha invalida.")
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalido.")
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
