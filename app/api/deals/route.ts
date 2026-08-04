import { createCrudHandlers } from '@/lib/server/crud-factory';
export const { GET, POST, PATCH, DELETE } = createCrudHandlers({ tableName: 'deals', ownerColumn: 'assigned_to' });
