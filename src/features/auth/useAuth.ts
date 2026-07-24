import { useCallback, useState } from 'react';

import { isSupabaseConfigured, supabase } from '@/services/supabase';
import { useSessionStore } from '@/stores/sessionStore';
import { useToastStore } from '@/stores/toastStore';
import type { SignInValues, SignUpValues } from './authSchemas';

/**
 * Authentification : Supabase quand il est configuré, sinon un mode
 * démo local honnête (le profil reste sur l'appareil).
 */
export function useAuth() {
  const setUser = useSessionStore((state) => state.setUser);
  const showToast = useToastStore((state) => state.show);
  const [submitting, setSubmitting] = useState(false);

  const signInWithEmail = useCallback(
    async (values: SignInValues): Promise<boolean> => {
      setSubmitting(true);
      try {
        if (supabase) {
          const { data, error } = await supabase.auth.signInWithPassword(values);
          if (error || !data.user) {
            showToast(error?.message ?? 'Connexion impossible', 'error');
            return false;
          }
          setUser({
            id: data.user.id,
            email: data.user.email ?? values.email,
            firstName: (data.user.user_metadata?.first_name as string | undefined) ?? 'Toi',
          });
        } else {
          // Mode démo : session locale.
          setUser({
            id: `local-${Date.now().toString(36)}`,
            email: values.email,
            firstName: values.email.split('@')[0] ?? 'Toi',
          });
        }
        showToast('Content de te revoir', 'success');
        return true;
      } finally {
        setSubmitting(false);
      }
    },
    [setUser, showToast],
  );

  const signUpWithEmail = useCallback(
    async (values: SignUpValues): Promise<boolean> => {
      setSubmitting(true);
      try {
        if (supabase) {
          const { data, error } = await supabase.auth.signUp({
            email: values.email,
            password: values.password,
            options: { data: { first_name: values.firstName } },
          });
          if (error || !data.user) {
            showToast(error?.message ?? 'Création de compte impossible', 'error');
            return false;
          }
          setUser({ id: data.user.id, email: values.email, firstName: values.firstName });
        } else {
          setUser({
            id: `local-${Date.now().toString(36)}`,
            email: values.email,
            firstName: values.firstName,
          });
        }
        showToast('Bienvenue sur Swivy', 'success');
        return true;
      } finally {
        setSubmitting(false);
      }
    },
    [setUser, showToast],
  );

  const signInWithProvider = useCallback(
    async (provider: 'google' | 'apple'): Promise<boolean> => {
      if (!supabase) {
        showToast(
          'Connexion sociale disponible une fois Supabase configuré — continue en invité.',
          'info',
        );
        return false;
      }
      const { error } = await supabase.auth.signInWithOAuth({ provider });
      if (error) {
        showToast(error.message, 'error');
        return false;
      }
      return true;
    },
    [showToast],
  );

  return {
    submitting,
    signInWithEmail,
    signUpWithEmail,
    signInWithProvider,
    isSupabaseConfigured,
  };
}
