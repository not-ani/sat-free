import type React from 'react';
import { api } from '@convex/_generated/api';
import type { FunctionReturnType } from 'convex/server';

export type Row = FunctionReturnType<typeof api.questions.list>['rows'][number];

export type Column = {
  header: string;
  accessor: (row: Row, rowIndex: number) => React.ReactNode;
};


