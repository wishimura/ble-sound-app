import { CSV_TEMPLATE } from '@/lib/services/operator-content';

export const runtime = 'nodejs';

/** Downloadable CSV template for bulk exhibit import. */
export function GET() {
  // Prefix BOM so Excel opens UTF-8 Japanese correctly.
  return new Response('﻿' + CSV_TEMPLATE, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="exhibits-template.csv"',
    },
  });
}
