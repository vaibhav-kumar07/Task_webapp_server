export interface IAuditFields {
    created_at: Date; // Timestamp for creation
    created_by: string; // User ID of creator
    updated_at: Date; // Timestamp for last update
    updated_by: string; // User ID of last updater
}
