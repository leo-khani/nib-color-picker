"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

interface IconButtonProps extends HTMLMotionProps<"button"> {
  label: string;
  children: ReactNode;
  active?: boolean;
}

export function IconButton({
  label,
  children,
  active = false,
  className = "",
  ...props
}: IconButtonProps) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      title={label}
      initial={false}
      animate={{
        scale: active ? 1.0 : 1,
      }}
      whileHover={{
        scale: 1.01,
        y: -1,
      }}
      whileTap={{
        scale: 0.92,
        y: 1,
      }}
      transition={{
        type: "spring",
        stiffness: 420,
        damping: 22,
      }}
      className={`inline-flex size-9 items-center justify-center rounded-ios-sm cursor-pointer ${
        active
          ? "bg-blue-100 text-blue-700 shadow-sm dark:bg-blue-500/20 dark:text-blue-200"
          : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300 hover:text-zinc-950 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-white"
      } ${className}`}
      {...props}
    >
      <motion.span
        className="inline-flex items-center justify-center"
        animate={{
          scale: active ? 1.03 : 1,
        }}
        whileHover={{
          scale: 1.1,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 18,
        }}
      >
        {children}
      </motion.span>
    </motion.button>
  );
}
