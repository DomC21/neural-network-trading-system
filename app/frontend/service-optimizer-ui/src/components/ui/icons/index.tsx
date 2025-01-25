import type { LucideProps } from 'lucide-react';
import {
  BarChart,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Search,
  Settings,
  HelpCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Users,
  MessageCircle,
  Minimize2,
  Maximize2,
  Send
} from 'lucide-react';

import * as React from 'react';

export type IconProps = LucideProps;

// Create Icon components with proper JSX rendering
export const Icons = {
  BarChart: React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
    <BarChart ref={ref} {...props} />
  )),
  TrendingUp: React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
    <TrendingUp ref={ref} {...props} />
  )),
  TrendingDown: React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
    <TrendingDown ref={ref} {...props} />
  )),
  AlertCircle: React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
    <AlertCircle ref={ref} {...props} />
  )),
  Search: React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
    <Search ref={ref} {...props} />
  )),
  Settings: React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
    <Settings ref={ref} {...props} />
  )),
  HelpCircle: React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
    <HelpCircle ref={ref} {...props} />
  )),
  FileText: React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
    <FileText ref={ref} {...props} />
  )),
  ChevronLeft: React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
    <ChevronLeft ref={ref} {...props} />
  )),
  ChevronRight: React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
    <ChevronRight ref={ref} {...props} />
  )),
  DollarSign: React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
    <DollarSign ref={ref} {...props} />
  )),
  Users: React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
    <Users ref={ref} {...props} />
  )),
  MessageCircle: React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
    <MessageCircle ref={ref} {...props} />
  )),
  Minimize2: React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
    <Minimize2 ref={ref} {...props} />
  )),
  Maximize2: React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
    <Maximize2 ref={ref} {...props} />
  )),
  Send: React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
    <Send ref={ref} {...props} />
  ))
};
