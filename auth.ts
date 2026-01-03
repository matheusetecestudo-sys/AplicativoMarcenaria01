import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface AuthUser {
    id: string;
    email: string | undefined;
    name: string | undefined;
    avatar_url: string | undefined;
}

/**
 * Login com email e senha usando Supabase Auth
 */
export const loginWithEmail = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
        return { user: null, error: { message: 'Supabase não configurado. Usando modo local.' } };
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) return { user: null, error };

        return {
            user: data.user ? {
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
                avatar_url: data.user.user_metadata?.avatar_url,
            } : null,
            error: null
        };
    } catch (error) {
        return { user: null, error: { message: 'Erro ao fazer login' } };
    }
};

/**
 * Login com GitHub OAuth via Supabase
 */
export const loginWithGitHub = async () => {
    if (!isSupabaseConfigured) {
        return { user: null, error: { message: 'Supabase não configurado' } };
    }

    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: `${window.location.origin}/#/dashboard`,
            }
        });

        if (error) return { user: null, error };

        return { user: null, error: null }; // O usuário será redirecionado
    } catch (error) {
        return { user: null, error: { message: 'Erro ao fazer login com GitHub' } };
    }
};

/**
 * Registro com email e senha
 */
export const signUpWithEmail = async (email: string, password: string, name: string) => {
    if (!isSupabaseConfigured) {
        return { user: null, error: { message: 'Supabase não configurado' } };
    }

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                }
            }
        });

        if (error) return { user: null, error };

        return {
            user: data.user ? {
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.name || name,
                avatar_url: data.user.user_metadata?.avatar_url,
            } : null,
            error: null
        };
    } catch (error) {
        return { user: null, error: { message: 'Erro ao criar conta' } };
    }
};

/**
 * Logout do Supabase
 */
export const logoutSupabase = async () => {
    if (!isSupabaseConfigured) return;

    try {
        await supabase.auth.signOut();
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
    }
};

/**
 * Recuperar senha
 */
export const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured) {
        return { error: { message: 'Supabase não configurado' } };
    }

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin,
        });

        if (error) return { error };
        return { error: null };
    } catch (error) {
        return { error: { message: 'Erro ao enviar email de recuperação' } };
    }
};

/**
 * Atualizar senha (para usuário logado)
 */
export const updatePassword = async (password: string) => {
    if (!isSupabaseConfigured) {
        return { error: { message: 'Supabase não configurado' } };
    }

    try {
        const { data, error } = await supabase.auth.updateUser({ password });
        if (error) return { error };
        return { data, error: null };
    } catch (error) {
        return { error: { message: 'Erro ao atualizar senha' } };
    }
};

/**
 * Obter sessão atual
 */
export const getCurrentSession = async () => {
    if (!isSupabaseConfigured) return null;

    try {
        const { data } = await supabase.auth.getSession();
        return data.session;
    } catch (error) {
        console.error('Erro ao obter sessão:', error);
        return null;
    }
};

/**
 * Obter usuário atual
 */
export const getCurrentUser = async (): Promise<AuthUser | null> => {
    if (!isSupabaseConfigured) return null;

    try {
        const { data } = await supabase.auth.getUser();
        if (!data.user) return null;

        return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
            avatar_url: data.user.user_metadata?.avatar_url,
        };
    } catch (error) {
        console.error('Erro ao obter usuário:', error);
        return null;
    }
};

/**
 * Listener para mudanças de autenticação
 */
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
    if (!isSupabaseConfigured) return { data: { subscription: { unsubscribe: () => { } } } };

    return supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
            callback({
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
                avatar_url: session.user.user_metadata?.avatar_url,
            });
        } else {
            callback(null);
        }
    });
};
