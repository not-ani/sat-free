'use client';

import { ChevronDown, Highlighter, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useExam } from './exam-context';

export function ExamHeader() {
  const [showDirections, setShowDirections] = useState(false);
  const { toolMode, setToolMode } = useExam();

  return (
    <header className="border-border border-b bg-background">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold text-foreground text-lg">
            Section 1: Reading and Writing
          </h1>
        </div>
        <div className="text-center">
          <h2 className="font-medium text-base text-foreground">
            Bluebook Exams
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">98% 🎯</span>
        </div>
      </div>
      <div className="flex items-center justify-between border-border border-t px-6 py-2">
        <Button
          className="gap-2"
          onClick={() => setShowDirections(!showDirections)}
          size="sm"
          variant="ghost"
        >
          Directions
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              showDirections && 'rotate-180'
            )}
          />
        </Button>
        <div className="flex items-center gap-2">
          <Button
            className="gap-2"
            onClick={() =>
              setToolMode(toolMode === 'highlight' ? 'none' : 'highlight')
            }
            size="sm"
            variant={toolMode === 'highlight' ? 'default' : 'ghost'}
          >
            <Highlighter className="h-4 w-4" />
            Highlight
          </Button>
          <Button
            className="gap-2"
            onClick={() =>
              setToolMode(toolMode === 'eliminate' ? 'none' : 'eliminate')
            }
            size="sm"
            variant={toolMode === 'eliminate' ? 'default' : 'ghost'}
          >
            <X className="h-4 w-4" />
            Eliminate
          </Button>
        </div>
      </div>
      {showDirections && (
        <div className="border-border border-t bg-muted/30 px-6 py-4">
          <p className="text-muted-foreground text-sm">
            Read each question carefully and select the best answer. You can
            mark questions for review and return to them later. Use the
            highlight tool to mark important text and the eliminate tool to
            cross out answer choices.
          </p>
        </div>
      )}
    </header>
  );
}
