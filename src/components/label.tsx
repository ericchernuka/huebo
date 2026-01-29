import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function Label({ children, ...props }: Props) {
  return <h2 {...props}>{children}</h2>;
}
