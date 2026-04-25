import { z } from "zod";
import { protectedProcedure } from "../../middleware/auth";

export const deleteClassProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    if (ctx.profile?.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const { error } = await ctx.supabase
      .from("classes")
      .delete()
      .eq("id", input.id);

    if (error) throw new Error(error.message);

    return { success: true };
  });
