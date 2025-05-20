'use client'

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const AuthFooter = () => {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  
  // Only show auth footer on auth pages
  if (!pathname?.startsWith('/auth')) {
    return null;
  }
  
  return (
    <footer className={cn(
      "w-full mt-auto",
      "bg-background/50 backdrop-blur-xl border-t border-border/10",
      "py-4"
    )}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} SmartPC. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link 
              href="/privacy" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Security & Privacy Policy
            </Link>
            <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <Link 
              href="/terms" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AuthFooter; 