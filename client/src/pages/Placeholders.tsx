import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const PageWrapper = ({ title }: { title: string }) => (
  <div className="min-h-screen bg-background flex flex-col">
    <Navbar />
    <main className="flex-1 container mx-auto px-6 max-w-7xl pt-32 pb-16 flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-4">{title}</h1>
      <p className="text-secondary max-w-md">This page is currently under construction for Phase 2.</p>
    </main>
    <Footer />
  </div>
);

export const Courses = () => <PageWrapper title="Courses" />;
export const Pricing = () => <PageWrapper title="Pricing" />;
export const About = () => <PageWrapper title="About Us" />;
export const Contact = () => <PageWrapper title="Contact" />;
export const Dashboard = () => <PageWrapper title="Student Dashboard" />;
export const NotFound = () => <PageWrapper title="404 - Page Not Found" />;
