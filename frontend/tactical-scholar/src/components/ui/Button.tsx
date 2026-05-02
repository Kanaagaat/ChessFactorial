import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          {
            'bg-primary text-slate-950 shadow-[inset_0_1px_0_rgba(248,250,252,0.45),0_10px_24px_rgba(16,185,129,0.35)] hover:bg-primary-strong hover:shadow-[inset_0_1px_0_rgba(248,250,252,0.65),0_12px_28px_rgba(16,185,129,0.45)]': variant === 'primary',
            'border border-border-soft text-text-primary hover:bg-white/5': variant === 'outline',
            'text-text-secondary hover:text-text-primary hover:bg-white/5': variant === 'ghost',
            'bg-danger text-slate-50 shadow-[inset_0_1px_0_rgba(248,250,252,0.2)] hover:brightness-95': variant === 'danger',
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-4 py-2': size === 'md',
            'h-12 px-8 text-lg': size === 'lg',
          },
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/60 border-t-white" />}
        {props.children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
