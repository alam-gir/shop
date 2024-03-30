"use client";
import { FC } from "react";
import { ThemeProvider as NextTheme } from "next-themes";
import {ThemeProviderProps} from 'next-themes/dist/types';


const ThemeProvider: FC<ThemeProviderProps> = ({ children, ...props }) => {
  return <NextTheme {...props}>{children}</NextTheme>;  
};

export default ThemeProvider;
