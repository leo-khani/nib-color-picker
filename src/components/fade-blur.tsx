"use client";

import { motion, type HTMLMotionProps, useInView, useReducedMotion } from "motion/react";
import { type ReactNode, useRef } from "react";

interface FadeBlurProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children?: ReactNode;
  delay?: number;
  duration?: number;
  animateOnScroll?: boolean;
  once?: boolean;
  amount?: number;
  y?: number;
  blur?: number;
}

export function FadeBlur({
  children,
  delay = 0,
  duration,
  animateOnScroll = false,
  once = true,
  amount = 0.2,
  y = 40,
  blur = 20,
  className,
  ...props
}: FadeBlurProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const isInView = useInView(ref, {
    once,
    amount,
  });

  const isVisible = animateOnScroll ? isInView : true;

  return (
    <motion.div
      ref={ref}
      layout={!shouldReduceMotion}
      initial={
        shouldReduceMotion
          ? false
          : {
              opacity: 0,
              y,
              filter: `blur(${blur}px)`,
            }
      }
      animate={{
        opacity: shouldReduceMotion || isVisible ? 1 : 0,
        y: shouldReduceMotion || isVisible ? 0 : y,
        filter: shouldReduceMotion || isVisible ? "blur(0px)" : `blur(${blur}px)`,
      }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : duration !== undefined
            ? { duration, delay, ease: [0.22, 1, 0.36, 1] }
            : {
                type: "spring",
                stiffness: 600,
                damping: 30,
                mass: 1.3,
                delay,
              }
      }
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
