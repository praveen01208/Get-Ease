import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { IconButton } from "./Button";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Modal = ({ isOpen, onClose, title, children, className }: ModalProps) => {
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                "w-full max-w-lg bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden pointer-events-auto",
                className
              )}
            >
              {title && (
                <div className="flex items-center justify-between p-6 border-b border-border/50">
                  <h3 className="text-lg font-semibold text-primary">{title}</h3>
                  <IconButton variant="ghost" onClick={onClose} className="h-8 w-8">
                    <X className="w-5 h-5" />
                  </IconButton>
                </div>
              )}
              <div className={cn("p-6", !title && "pt-6 relative")}>
                {!title && (
                  <IconButton 
                    variant="ghost" 
                    onClick={onClose} 
                    className="absolute top-4 right-4 h-8 w-8"
                  >
                    <X className="w-5 h-5" />
                  </IconButton>
                )}
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
