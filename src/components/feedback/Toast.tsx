import { AnimatePresence, motion } from "motion/react";

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-12 z-50 flex justify-center"
      aria-live="polite"
    >
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="rounded-ios-lg bg-zinc-900 px-3 py-2 text-sm text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
