import React from "react";
import { cn } from "../../lib/utils";
import {
  IconArrowWaveRightUp,
  IconBoxAlignRightFilled,
  IconBoxAlignTopLeft,
  IconClipboardCopy,
  IconFileBroken,
  IconSignature,
  IconTableColumn,
} from "@tabler/icons-react";

export const BentoGrid = ({ className, children }) => (
  <div
    className={cn(
      "mx-auto grid max-w-7xl grid-cols-1 gap-4 md:auto-rows-[18rem] md:grid-cols-3",
      className
    )}
  >
    {children}
  </div>
);

export const BentoGridItem = ({ className, title, description, header, icon }) => (
  <div
    className={cn(
      "group/bento shadow-input row-span-1 flex flex-col justify-between space-y-4 rounded-xl border border-neutral-200 bg-white p-4 transition duration-200 hover:shadow-xl dark:border-white/[0.2] dark:bg-black dark:shadow-none",
      className
    )}
  >
    {header}
    <div className="transition duration-200 group-hover/bento:translate-x-2">
      {icon}
      <div className="mt-2 mb-2 font-serif font-bold text-neutral-600 dark:text-neutral-200" style={{ fontFamily: "'DM Serif Display', serif" }}>
        {title}
      </div>
      <div className="font-sans text-xs font-normal text-neutral-600 dark:text-neutral-300" style={{ fontFamily: "Sora, Inter, sans-serif" }}>
        {description}
      </div>
    </div>
  </div>
);

const Skeleton = () => (
  <div
    className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100"></div>
); 