'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  barClassName?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, barClassName, ...props }, ref) => {
    // 値の正規化（0-100%の範囲に収める）
    const normalizedValue = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className={cn(
          'relative h-4 w-full overflow-hidden rounded-full bg-gray-200',
          className
        )}
        {...props}
      >
        <div
          className={cn("h-full flex-1 transition-all duration-300 ease-out", barClassName)}
          style={{
            width: `${normalizedValue}%`,
            transformOrigin: 'left center'
          }}
        />
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };
