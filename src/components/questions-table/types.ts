import type { api } from '@convex/_generated/api';
import type { FunctionReturnType } from 'convex/server';
import type React from 'react';

export type Row = FunctionReturnType<typeof api.questions.list>['rows'][number];

export type Column = {
  header: string;
  accessor: (row: Row, rowIndex: number) => React.ReactNode;
};
