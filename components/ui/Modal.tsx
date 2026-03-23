"use client";

import { useEffect, useCallback, ReactNode, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Max width class, default 520px */
  maxWidth?: number;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 520,
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  // Return focus to trigger when closed
  useEffect(() => {
    if (!isOpen) return;
    // Focus first focusable element inside modal
    const timer = setTimeout(() => {
      const firstFocusable = contentRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        // Overlay
        <motion.div
          key="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          aria-modal="true"
          role="dialog"
          aria-labelledby="modal-title"
        >
          {/* Panel */}
          <motion.div
            key="modal-panel"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="modal-content"
            style={{ maxWidth }}
            ref={contentRef}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 pt-5 pb-4"
              style={{ borderBottom: "1px solid var(--color-border-muted)" }}
            >
              <h2
                id="modal-title"
                className="heading-3"
                style={{ color: "var(--color-text-primary)" }}
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                className="btn btn-ghost btn-sm"
                style={{ padding: 6 }}
                aria-label="Close modal"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
