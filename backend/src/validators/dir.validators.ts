import {z} from "zod";

export const updateDirSchema = z.object({
  name: z.string()
});

export type updateDirInput = z.infer<typeof updateDirSchema>;