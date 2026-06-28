import { createBrowserClient, createServerClient } from '@supabase/ssr';
import type { SupabaseClient, User } from '@supabase/supabase-js';

// Browser client for client components
export function createClient(): SupabaseClient {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Server client for server components and API routes
export function createServerClientInternal(
  cookies: {
    get: (name: string) => string | undefined;
    set: (name: string, value: string, options?: Record<string, unknown>) => void;
    delete: (name: string, options?: Record<string, unknown>) => void;
  }
): SupabaseClient {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return Object.keys(cookies).map((name) => ({
            name,
            value: cookies.get(name) || '',
          }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookies.set(name, value, options);
          });
        },
      },
    }
  );
}

// Get current user
export async function getUser(supabase: SupabaseClient): Promise<User | null> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

// Check if user is authenticated
export async function requireAuth(supabase: SupabaseClient): Promise<User> {
  const user = await getUser(supabase);
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

// Get user profile with organisation
export async function getUserProfile(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      organisation:organisations(*)
    `)
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

// Organisation helpers
export async function getOrganisationId(supabase: SupabaseClient, userId: string): Promise<string | null> {
  const profile = await getUserProfile(supabase, userId);
  return profile?.organisationId || null;
}

// RLS-safe data fetching helpers
export async function fetchOrganisationData<T>(
  supabase: SupabaseClient,
  table: string,
  organisationId: string,
  filters?: Record<string, unknown>
): Promise<T[]> {
  let query = supabase.from(table).select('*').eq('organisation_id', organisationId);
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Check user role in organisation
export async function checkOrganisationRole(
  supabase: SupabaseClient,
  userId: string,
  organisationId: string,
  allowedRoles: ('owner' | 'admin' | 'member')[]
): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .eq('organisation_id', organisationId)
    .single();
  
  if (error || !data) return false;
  return allowedRoles.includes(data.role);
}

// Require organisation role
export async function requireOrganisationRole(
  supabase: SupabaseClient,
  userId: string,
  organisationId: string,
  allowedRoles: ('owner' | 'admin' | 'member')[]
): Promise<void> {
  const hasRole = await checkOrganisationRole(supabase, userId, organisationId, allowedRoles);
  if (!hasRole) {
    throw new Error('Insufficient permissions');
  }
}

// Generate quote number
export async function generateQuoteNumber(
  supabase: SupabaseClient,
  organisationId: string
): Promise<string> {
  const year = new Date().getFullYear();
  
  // Get count of quotes this year
  const { count, error } = await supabase
    .from('quotes')
    .select('*', { count: 'exact', head: true })
    .eq('organisation_id', organisationId)
    .gte('created_at', `${year}-01-01`);
  
  if (error) throw error;
  
  const seq = (count || 0) + 1;
  return `QQ-${year}-${String(seq).padStart(4, '0')}`;
}

// Create audit event
export async function createAuditEvent(
  supabase: SupabaseClient,
  params: {
    organisationId?: string;
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    oldData?: Record<string, unknown>;
    newData?: Record<string, unknown>;
  }
) {
  const { error } = await supabase.from('audit_events').insert({
    organisation_id: params.organisationId,
    user_id: params.userId,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId,
    old_data: params.oldData,
    new_data: params.newData
  });
  
  if (error) {
    console.error('Failed to create audit event:', error);
  }
}

// Create notification
export async function createNotification(
  supabase: SupabaseClient,
  params: {
    organisationId: string;
    userId?: string;
    type: string;
    title: string;
    message?: string;
    actionUrl?: string;
  }
) {
  const { error } = await supabase.from('notifications').insert({
    organisation_id: params.organisationId,
    user_id: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    action_url: params.actionUrl
  });
  
  if (error) {
    console.error('Failed to create notification:', error);
  }
}