"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { PixelBadge } from "./pixel-badge";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  badge?: string;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  badge,
  breadcrumb,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`mb-8 ${className}`}
    >
      {breadcrumb && (
        <div className="mb-4">
          {breadcrumb}
        </div>
      )}
      
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <Icon className="w-8 h-8 text-primary" />
          )}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-heading text-foreground text-3xl font-bold">
                {title}
              </h1>
              {badge && (
                <PixelBadge variant="default" className="hidden sm:flex">
                  {badge}
                </PixelBadge>
              )}
            </div>
            {description && (
              <p className="text-muted-foreground text-sm max-w-2xl">
                {description}
              </p>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </motion.div>
  );
}
