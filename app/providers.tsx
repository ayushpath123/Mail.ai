'use client';
import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { CVChatbot } from '@/components/cv-chatbot';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      {children}
      <CVChatbot />
    </SessionProvider>
  );
};