import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SupabaseService {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
    }

    subscribeToTasks(callback: (payload: any) => void) {
        return this.supabase
            .channel('tasks-channel')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'tasks' },
                (payload) => callback(payload)
            )
            .subscribe();
    }

    subscribeToUsers(callback: (payload: any) => void) {
        return this.supabase
            .channel('users-channel')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'users' },
                (payload) => callback(payload)
            )
            .subscribe();
    }

    getImageUrl(bucket: string, path: string): string {
        const { data } = this.supabase.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
    }
}