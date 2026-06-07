import { z } from 'zod';

const profileCoreSchema = z.object({
  bio: z.string().max(160, { message: 'Bio must be 160 characters or less' }).optional(),
  favoriteCategories: z.array(z.string()).optional(),
});

export const profileFormSchema = profileCoreSchema.extend({
  age: z.string().optional().refine(
    (value) => {
      if (value === undefined || value.trim() === '') {
        return true;
      }

      const numberValue = Number(value);
      return (
        Number.isInteger(numberValue)
        && numberValue >= 6
        && numberValue <= 120
      );
    },
    { message: 'Age must be a whole number between 6 and 120.' },
  ),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;
