'use server';

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ResumeData } from "@/types/resume";

export async function saveResume(data: ResumeData, title: string = "Untitled Resume", id?: string) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    throw new Error("Unauthorized");
  }

  const email = user.emailAddresses[0]?.emailAddress || "no-email@example.com";

  // Ensure user exists in local DB
  await prisma.user.upsert({
    where: { id: userId },
    update: { email },
    create: {
      id: userId,
      email,
    },
  });

  let resume;
  if (id) {
      resume = await prisma.resume.update({
          where: { id, userId },
          data: {
              title,
              content: JSON.stringify(data),
              updatedAt: new Date(),
          }
      });
  } else {
      resume = await prisma.resume.create({
        data: {
          userId,
          title,
          content: JSON.stringify(data),
          atsScore: 0, // Default
        },
      });
  }

  revalidatePath('/dashboard');
  return {
    ...resume,
    content: JSON.parse(resume.content) as ResumeData
  };
}

export async function getUserResumes() {
  const { userId } = await auth();
  if (!userId) return [];

  const resumes = await prisma.resume.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });

  return resumes.map((resume: any) => ({
    ...resume,
    content: JSON.parse(resume.content) as ResumeData
  }));
}
