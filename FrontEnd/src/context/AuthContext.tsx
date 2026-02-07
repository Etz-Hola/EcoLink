import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  googleLogin: (idToken: string, role?: string) => Promise<void>;
  walletLogin: (address: string, message: string, signature: string, role?: string) => Promise<void>;
  getNonce: () => Promise<string>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on app load
  useEffect(() => {
    const token = localStorage.getItem('ecolink_token');
    const userData = localStorage.getItem('ecolink_user');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      } catch (error) {
        localStorage.removeItem('ecolink_token');
        localStorage.removeItem('ecolink_user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email, password })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }

      const { user, tokens } = data;
      localStorage.setItem('ecolink_token', tokens.accessToken);
      localStorage.setItem('ecolink_user', JSON.stringify(user));

      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: tokens.accessToken } });
    } catch (error: any) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  const register = async (userData: any): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userData,
          authProvider: 'email'
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      const { user, tokens } = data;
      localStorage.setItem('ecolink_token', tokens.accessToken);
      localStorage.setItem('ecolink_user', JSON.stringify(user));

      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: tokens.accessToken } });
    } catch (error: any) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  const googleLogin = async (idToken: string, role?: string): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, role })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Google login failed');
      }

      const { user, tokens } = data;
      localStorage.setItem('ecolink_token', tokens.accessToken);
      localStorage.setItem('ecolink_user', JSON.stringify(user));

      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: tokens.accessToken } });
    } catch (error: any) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  const getNonce = async (): Promise<string> => {
    const response = await fetch(`${API_URL}/auth/nonce`);
    const data = await response.json();
    return data.nonce;
  };

  const walletLogin = async (address: string, message: string, signature: string, role?: string): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await fetch(`${API_URL}/auth/verify-wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, message, signature, role })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Wallet login failed');
      }

      const { user, tokens } = data;
      localStorage.setItem('ecolink_token', tokens.accessToken);
      localStorage.setItem('ecolink_user', JSON.stringify(user));

      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: tokens.accessToken } });
    } catch (error: any) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  const logout = (): void => {
    localStorage.removeItem('ecolink_token');
    localStorage.removeItem('ecolink_user');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData: Partial<User>): void => {
    dispatch({ type: 'UPDATE_USER', payload: userData });

    if (state.user) {
      const updatedUser = { ...state.user, ...userData };
      localStorage.setItem('ecolink_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        googleLogin,
        walletLogin,
        getNonce,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext }