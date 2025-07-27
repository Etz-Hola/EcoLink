import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Material, Branch, AppState } from '../types';

interface AppContextType extends AppState {
  addMaterial: (material: Material) => void;
  updateMaterial: (materialId: string, updates: Partial<Material>) => void;
  deleteMaterial: (materialId: string) => void;
  setCurrentMaterial: (material: Material | null) => void;
  setBranches: (branches: Branch[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

type AppAction =
  | { type: 'ADD_MATERIAL'; payload: Material }
  | { type: 'UPDATE_MATERIAL'; payload: { id: string; updates: Partial<Material> } }
  | { type: 'DELETE_MATERIAL'; payload: string }
  | { type: 'SET_MATERIALS'; payload: Material[] }
  | { type: 'SET_CURRENT_MATERIAL'; payload: Material | null }
  | { type: 'SET_BRANCHES'; payload: Branch[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'ADD_MATERIAL':
      return {
        ...state,
        materials: [...state.materials, action.payload]
      };
    case 'UPDATE_MATERIAL':
      return {
        ...state,
        materials: state.materials.map(material =>
          material.id === action.payload.id
            ? { ...material, ...action.payload.updates }
            : material
        )
      };
    case 'DELETE_MATERIAL':
      return {
        ...state,
        materials: state.materials.filter(material => material.id !== action.payload)
      };
    case 'SET_MATERIALS':
      return {
        ...state,
        materials: action.payload
      };
    case 'SET_CURRENT_MATERIAL':
      return {
        ...state,
        currentMaterial: action.payload
      };
    case 'SET_BRANCHES':
      return {
        ...state,
        branches: action.payload
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
    default:
      return state;
  }
};

const initialState: AppState = {
  materials: [],
  branches: [],
  currentMaterial: null,
  isLoading: false,
  error: null
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const addMaterial = (material: Material): void => {
    dispatch({ type: 'ADD_MATERIAL', payload: material });
  };

  const updateMaterial = (materialId: string, updates: Partial<Material>): void => {
    dispatch({ type: 'UPDATE_MATERIAL', payload: { id: materialId, updates } });
  };

  const deleteMaterial = (materialId: string): void => {
    dispatch({ type: 'DELETE_MATERIAL', payload: materialId });
  };

  const setCurrentMaterial = (material: Material | null): void => {
    dispatch({ type: 'SET_CURRENT_MATERIAL', payload: material });
  };

  const setBranches = (branches: Branch[]): void => {
    dispatch({ type: 'SET_BRANCHES', payload: branches });
  };

  const setLoading = (loading: boolean): void => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null): void => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        addMaterial,
        updateMaterial,
        deleteMaterial,
        setCurrentMaterial,
        setBranches,
        setLoading,
        setError
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};