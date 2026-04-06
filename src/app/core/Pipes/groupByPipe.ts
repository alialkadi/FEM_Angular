import { Pipe } from '@angular/core';

@Pipe({ name: 'groupBy' })
export class GroupByPipe {
  transform(items: any[], field: string) {
    if (!items) return [];
    const grouped = items.reduce(
      (acc, item) => {
        const key = item[field];
        acc[key] = acc[key] || [];
        acc[key].push(item);
        return acc;
      },
      {} as Record<string, any[]>,
    );

    return Object.keys(grouped).map((key) => ({
      key,
      items: grouped[key],
    }));
  }
}
