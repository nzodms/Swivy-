import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().min(1, 'L’email est requis').email('Cet email semble invalide'),
  password: z.string().min(8, 'Au moins 8 caractères'),
});
export type SignInValues = z.infer<typeof signInSchema>;

export const signUpSchema = signInSchema.extend({
  firstName: z.string().min(2, 'Ton prénom nous aide à personnaliser l’app'),
});
export type SignUpValues = z.infer<typeof signUpSchema>;
