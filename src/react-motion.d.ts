declare module 'react-motion' {
  import { Component, ReactNode } from 'react';

  export interface SpringConfig {
    damping: number;
    stiffness: number;
  }

  export interface PlainStyle {
    [key: string]: number;
  }

  export interface Style {
    [key: string]: OpaqueConfig;
  }

  export type OpaqueConfig = number | { config?: SpringConfig; val: number };

  export function spring(val: number, config?: SpringConfig): OpaqueConfig;

  export interface MotionProps {
    children: (interpolatedStyle: PlainStyle) => ReactNode;
    defaultStyle?: PlainStyle;
    onRest?: () => void;
    style: Style;
  }

  export class Motion extends Component<MotionProps> {}
}
