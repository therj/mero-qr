'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

import { MoonIcon, SunIcon } from '@radix-ui/react-icons';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
};

interface ThemeToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = `absolute top-10 right-10`,
}) => {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(className)} asChild>
        <Button variant="outline" size="icon">
          <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme(`light`)}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme(`dark`)}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme(`system`)}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { ThemeToggle, ThemeProvider };
