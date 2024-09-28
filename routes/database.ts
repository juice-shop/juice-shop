// database.ts
import { MemoryModel } from 'models/memory'; // Adjust the import based on your project structure

export function executeQuery(query: string): Promise<any> {
  return MemoryModel.sequelize.query(query);
}