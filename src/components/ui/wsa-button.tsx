"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const wsaButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-lg font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-0 overflow-hidden text-ellipsis transform-gpu transition-all duration-300 ease-in-out rounded-full",
  {
    variants: {
      variant: {
        primary: "bg-[#F26B21] text-white shadow-[0_0_30px_#F5EAE5] hover:bg-[#F26B21] hover:text-white hover:shadow-none",
        hero: "bg-[#F26B21] text-white border-0 shadow-[0_0_0_4px_rgba(253,238,232,0.8)] hover:bg-[#F26B21] hover:text-white hover:shadow-[0_0_0_0px_transparent] transition-all duration-300 ease-in-out",
        secondary: "bg-[#d4ecf4] text-gray-700 hover:bg-[#0CADC4] hover:text-white shadow-[0_0_30px_#F5EAE5] hover:shadow-none",
        outline: "border-2 border-[#F26B21] text-[#F26B21] hover:bg-[#F26B21] hover:text-white bg-transparent shadow-[0_0_30px_#F5EAE5] hover:shadow-none",
        ghost: "bg-transparent hover:bg-gray-100 text-gray-700 shadow-none hover:shadow-md",
      },
      size: {
        default: "h-[42px] px-6",
        sm: "h-9 px-4 text-base",
        lg: "h-[50px] px-8",
        xl: "h-[56px] px-10",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface WSAButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof wsaButtonVariants> {
  asChild?: boolean;
}

const WSAButton = React.forwardRef<HTMLButtonElement, WSAButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(wsaButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
WSAButton.displayName = "WSAButton";

export { WSAButton, wsaButtonVariants };