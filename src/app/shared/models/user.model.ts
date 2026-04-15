export interface User {
    id: string;
    name: string;
    email: string;
    position: string;
    created_at: string;
    updated_at: string;
    phone?: string;
    profile_image_url?: string | null;
    last_name?: string;
}