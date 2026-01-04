import { Post } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createPost = async (
  data: Omit<Post, "id" | "createAt" | "updatedAt">
) => {
  const result = await prisma.post.create({
    data,
  });
  return result;
};

export const postServices = {
  createPost,
};
