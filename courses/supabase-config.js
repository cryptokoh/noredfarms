/**
 * Supabase Client Configuration
 * Nored Farms - Course Platform
 *
 * Uses Supabase CDN (loaded in HTML <head>) with lazy singleton pattern.
 * Set your project URL and anon key below.
 */

const SUPABASE_URL = 'https://uqyfsqenjakqyzixfcta.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxeWZzcWVuamFrcXl6aXhmY3RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NTQzMjAsImV4cCI6MjA4NTEzMDMyMH0.SFFaYsDxdlHCFU30aV3Qzi6SI7759o2bePCaqKAHkTA';

let _supabase = null;

function getSupabase() {
    if (!_supabase) {
        if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
            throw new Error('Supabase JS library not loaded. Include the CDN script before this file.');
        }
        _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            }
        });
    }
    return _supabase;
}
