import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { IconButton } from "./Button";
import { cn } from "@/lib/utils";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: "left" | "right" | "bottom";
  className?: string;
}

export const Drawer = ({ isOpen, onClose, children, position = "right", className }: DrawerProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const variants = {
    right: {
      initial: { x: "100%" },
      animate: { x: 0 },
      exit: { x: "100%" },
      className: "inset-y-0 right-0 w-full sm:w-[400px] border-l",
    },
    left: {
      initial: { x: "-100%" },
      animate: { x: 0 },
      exit: { x: "-100%" },
      className: "inset-y-0 left-0 w-full sm:w-[400px] border-r",
    },
    bottom: {
      initial: { y: "100%" },
      animate: { y: 0 },
      exit: { y: "100%" },
      className: "inset-x-0 bottom-0 w-full h-[80vh] sm:h-[50vh] border-t rounded-t-3xl",
    },
  };

  const config = variants[position];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={config.initial}
            animate={config.animate}
            exit={config.exit}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "fixed z-50 bg-surface border-border shadow-2xl flex flex-col",
              config.className,
              className
            )}
          >
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div />
              <IconButton variant="ghost" onClick={onClose} className="h-8 w-8">
                <X className="w-5 h-5" />
              </IconButton>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
