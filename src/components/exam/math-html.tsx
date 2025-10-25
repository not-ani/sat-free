'use client';
import { MathJax } from 'better-react-mathjax';

export function HtmlMath({ html }: { html: string }) {
  return (
    <MathJax dynamic inline>
      <span dangerouslySetInnerHTML={{ __html: html }} />
    </MathJax>
  );
}
