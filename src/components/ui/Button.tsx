import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
    'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
    {
        variants: {
            variant: {
                default:
                    'bg-santaan-amber text-white hover:bg-[#E08E45] shadow-sm hover:shadow-md hover:-translate-y-0.5',
                secondary:
                    'bg-santaan-teal text-white hover:bg-[#1A3333] shadow-sm hover:shadow-md',
                outline:
                    'border border-santaan-teal text-santaan-teal hover:bg-santaan-teal hover:text-white',
                ghost: 'hover:bg-slate-100 text-santaan-teal',
                link: 'text-santaan-teal underline-offset-4 hover:underline',
            },
            size: {
                default: 'h-10 px-6 py-2',
                sm: 'h-9 px-4',
                lg: 'h-12 px-8 text-base',
                icon: 'h-10 w-10',
            },
            fullWidth: {
                true: 'w-full',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
            fullWidth: false,
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, fullWidth, isLoading, children, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, fullWidth, className }))}
                ref={ref}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
