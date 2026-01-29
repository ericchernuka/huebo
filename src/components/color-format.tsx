import { ReactNode } from 'react';
import { Label } from './label';

interface Props {
  children: ReactNode;
  copied: boolean;
  'data-testid'?: string;
  label: string;
}

export function ColorFormat({ children, copied, label, ...props }: Props) {
  return (
    <div className="color-format-block" {...props}>
      <Label>{copied ? `${label} copied to clipboard` : label}</Label>
      {children}
    </div>
  );
}
