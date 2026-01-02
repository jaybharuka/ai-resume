import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import GlobalLayout from "@/components/GlobalLayout";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Resumex - AI-Powered Resume Builder",
  description: "AI-powered resume builder that helps you create, tailor, and optimize resumes for any job with ATS scoring and intelligent suggestions.",
  keywords: "resume, AI, ATS, job application, career, software engineer, resume optimizer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <GlobalLayout>
            {children}
          </GlobalLayout>
        </body>
      </html>
    </ClerkProvider>
  );
}
