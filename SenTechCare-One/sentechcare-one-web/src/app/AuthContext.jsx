import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, login as loginApi } from '@/api/authApi';
import {
  clearAuthSession,
  getAuthToken,
  getStoredAuthUser,
  setAuthToken,
  setStoredAuthUser
} from '@/lib/authToken';
import { extractApiErrorMessage } from '@/utils/apiError';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getAuthToken());
  const [currentUser, setCurrentUser] = useState(() => getStoredAuthUser());
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    clearAuthSession();
    setToken(null);
    setCurrentUser(null);
    setIsLoading(false);
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    const existingToken = getAuthToken();

    if (!existingToken) {
      clearAuthSession();
      setToken(null);
      setCurrentUser(null);
      return null;
    }

    try {
      const user = await getCurrentUser();
      setToken(existingToken);
      setCurrentUser(user);
      setStoredAuthUser(user);
      return user;
    } catch (error) {
      clearAuthSession();
      setToken(null);
      setCurrentUser(null);
      throw new Error(extractApiErrorMessage(error, "Impossible de recuperer l'utilisateur connecte."));
    }
  }, []);

  const login = useCallback(
    async (credentials) => {
      try {
        const data = await loginApi(credentials);
        const newToken = data?.accessToken;

        if (!newToken) {
          throw new Error('Le token JWT est manquant dans la réponse de connexion.');
        }

        setAuthToken(newToken);
        setToken(newToken);

        if (data?.user) {
          setCurrentUser(data.user);
          setStoredAuthUser(data.user);
        } else {
          await refreshCurrentUser();
        }

        return data;
      } catch (error) {
        throw new Error(extractApiErrorMessage(error, 'Echec de connexion. Verifiez vos identifiants.'));
      }
    },
    [refreshCurrentUser]
  );

  useEffect(() => {
    let isCancelled = false;

    const bootstrapAuth = async () => {
      const existingToken = getAuthToken();

      if (!existingToken) {
        clearAuthSession();
        if (!isCancelled) {
          setToken(null);
          setCurrentUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const user = await getCurrentUser();

        if (!isCancelled) {
          setToken(existingToken);
          setCurrentUser(user);
          setStoredAuthUser(user);
        }
      } catch {
        if (!isCancelled) {
          clearAuthSession();
          setToken(null);
          setCurrentUser(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    bootstrapAuth();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout]);

  const value = useMemo(
    () => ({
      token,
      currentUser,
      isLoading,
      isAuthenticated: Boolean(token),
      login,
      logout,
      refreshCurrentUser
    }),
    [token, currentUser, isLoading, login, logout, refreshCurrentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext doit être utilisé à l’intérieur de AuthProvider.');
  }

  return context;
}
