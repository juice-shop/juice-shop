// queryBuilder.ts
export function buildSearchQuery(criteria: string): string {
    return `SELECT * FROM Products WHERE ((name LIKE '%${criteria}%' OR description LIKE '%${criteria}%') AND deletedAt IS NULL) ORDER BY name`;
  }