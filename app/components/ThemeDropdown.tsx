'use client';

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { FaGear, FaMoon, FaSun } from "react-icons/fa6";

export default function ThemeDropdown()
{
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted)
  {
    return null;
  }

  return (
    <select
      value={theme}
      onChange={e => setTheme(e.target.value)}
      className="p-2 rounded border dark:border-white border-black bg-white dark:bg-black text-black dark:text-white"
    >
      <option value="light"><FaSun />Light</option>
      <option value="dark"><FaMoon />Dark</option>
      <option value="system"><FaGear />System</option>
    </select>
  )
}
