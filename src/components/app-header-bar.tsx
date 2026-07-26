import { IconColorPicker, IconHistory, IconSettingsFilled } from "@tabler/icons-react";
import { motion, useReducedMotion } from "motion/react";

export type AppSection = "picker" | "history";

interface AppHeaderBarProps {
  activeSection: AppSection;
  onSectionChange: (section: AppSection) => void;
  onOpenSettings: () => void;
  compact?: boolean;
}

const tabs = [
  { id: "picker", label: "Color Picker", icon: IconColorPicker },
  { id: "history", label: "History", icon: IconHistory },
] satisfies ReadonlyArray<{
  id: AppSection;
  label: string;
  icon: typeof IconColorPicker;
}>;

export default function AppHeaderBar({
  activeSection,
  onSectionChange,
  onOpenSettings,
  compact = false,
}: AppHeaderBarProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <header className="flex w-full items-center justify-between px-3 py-2">
      {compact ? (
        <span className="text-sm font-semibold text-zinc-100">Nib Color Picker</span>
      ) : (
        <nav
          aria-label="Application sections"
          className="flex items-center rounded-ios-lg bg-zinc-900 p-1"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;

            return (
              <motion.button
                key={tab.id}
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => onSectionChange(tab.id)}
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.96 }}
                className={`relative flex h-8 items-center gap-2 rounded-ios-sm px-3 text-sm font-medium outline-none ${
                  isActive
                    ? "text-zinc-950 dark:text-zinc-50"
                    : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="active-header-tab"
                    className="absolute inset-0 rounded-ios-sm bg-white shadow-sm dark:bg-zinc-700"
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 450, damping: 34 }
                    }
                  />
                )}
                <motion.span
                  className="relative z-10"
                  animate={
                    prefersReducedMotion
                      ? {}
                      : {
                          scale: isActive ? 1 : 0.9,
                        }
                  }
                  transition={{ type: "spring", stiffness: 400, damping: 24 }}
                >
                  <Icon size={17} aria-hidden="true" />
                </motion.span>
                <span className="relative z-10 whitespace-nowrap">{tab.label}</span>
              </motion.button>
            );
          })}
        </nav>
      )}

      <motion.button
        type="button"
        aria-label="Open settings"
        title="Settings"
        onClick={onOpenSettings}
        whileHover={prefersReducedMotion ? {} : { scale: 1.06 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
        transition={{ type: "spring", stiffness: 450, damping: 20 }}
        className="flex size-8 items-center justify-center rounded-ios-sm bg-zinc-200/70 text-zinc-700 outline-none hover:bg-zinc-300 hover:text-zinc-950 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-white"
      >
        <IconSettingsFilled size={18} aria-hidden="true" />
      </motion.button>
    </header>
  );
}
