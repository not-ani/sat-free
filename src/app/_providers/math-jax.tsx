'use client';
import { MathJaxContext } from 'better-react-mathjax';

export const MathJaxProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div>
      <MathJaxContext>{children}</MathJaxContext>
    </div>
  );
};
