'use client';
import { useCallback, useState } from 'react';
import type { SubmissionResult } from './types';

export function useSubmissionState<T extends SubmissionResult>() {
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<T | null>(null);

  const handleSubmit = useCallback((result: T, onSubmit?: (r: T) => void) => {
    setFeedback(result);
    setSubmitted(true);
    onSubmit?.(result);
  }, []);

  const reset = useCallback(() => {
    setSubmitted(false);
    setFeedback(null);
  }, []);

  return { submitted, feedback, handleSubmit, reset };
}
