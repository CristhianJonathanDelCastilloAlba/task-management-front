export interface Comment {
    id: string;
    text: string;
    user_id: string;
    user_name: string;
    is_edited?: boolean;
    image_url?: string | null;
    created_at: string;
    updated_at?: string;
    images?: string[];
}