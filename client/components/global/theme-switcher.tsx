"use client";
import { Button } from "@nextui-org/react";
import { useTheme } from "next-themes";
import { FC, useEffect, useState } from "react";

interface ThemeSwitcherProps {}

const ThemeSwitcher: FC<ThemeSwitcherProps> = ({}) => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const themehandle = () => {
    if (theme === "dark") setTheme("light");
    else setTheme("dark");
  };

  return (
    <div>
      <Button onClick={themehandle}>Change Theme</Button>
    </div>
  );
};

export default ThemeSwitcher;
