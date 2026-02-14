import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
} from 'react';
import type { AppData, Purchase } from '../types';
import { loadAppData, saveAppData } from '../utils/storage';
import { USE_SEED_DATA, generateSeedData } from '../utils/seedData';

type Action =
  | { type: 'LOAD_DATA'; payload: AppData }
  | { type: 'ADD_PURCHASE'; weekStart: string; purchase: Purchase }
  | { type: 'EDIT_PURCHASE'; weekStart: string; purchase: Purchase }
  | { type: 'DELETE_PURCHASE'; weekStart: string; purchaseId: string }
  | { type: 'SET_BUDGET'; weekStart: string; budget: number }
  | { type: 'ENSURE_WEEK_EXISTS'; weekStart: string };

function appReducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'LOAD_DATA':
      return action.payload;

    case 'ENSURE_WEEK_EXISTS': {
      if (state.weeks[action.weekStart]) return state;
      return {
        ...state,
        weeks: {
          ...state.weeks,
          [action.weekStart]: {
            startDate: action.weekStart,
            budget: state.defaultBudget,
            purchases: [],
          },
        },
      };
    }

    case 'ADD_PURCHASE': {
      const week = state.weeks[action.weekStart];
      if (!week) return state;
      return {
        ...state,
        weeks: {
          ...state.weeks,
          [action.weekStart]: {
            ...week,
            purchases: [...week.purchases, action.purchase],
          },
        },
      };
    }

    case 'EDIT_PURCHASE': {
      const week = state.weeks[action.weekStart];
      if (!week) return state;
      return {
        ...state,
        weeks: {
          ...state.weeks,
          [action.weekStart]: {
            ...week,
            purchases: week.purchases.map((p) =>
              p.id === action.purchase.id ? action.purchase : p,
            ),
          },
        },
      };
    }

    case 'DELETE_PURCHASE': {
      const week = state.weeks[action.weekStart];
      if (!week) return state;
      return {
        ...state,
        weeks: {
          ...state.weeks,
          [action.weekStart]: {
            ...week,
            purchases: week.purchases.filter(
              (p) => p.id !== action.purchaseId,
            ),
          },
        },
      };
    }

    case 'SET_BUDGET': {
      const week = state.weeks[action.weekStart];
      if (!week) return state;
      return {
        ...state,
        defaultBudget: action.budget,
        weeks: {
          ...state.weeks,
          [action.weekStart]: {
            ...week,
            budget: action.budget,
          },
        },
      };
    }

    default:
      return state;
  }
}

interface AppContextValue {
  data: AppData;
  isLoading: boolean;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, dispatch] = useReducer(appReducer, {
    weeks: {},
    defaultBudget: 400,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (USE_SEED_DATA) {
      dispatch({ type: 'LOAD_DATA', payload: generateSeedData() });
      setHasLoaded(true);
      setIsLoading(false);
    } else {
      loadAppData().then((loaded) => {
        dispatch({ type: 'LOAD_DATA', payload: loaded });
        setHasLoaded(true);
        setIsLoading(false);
      });
    }
  }, []);

  useEffect(() => {
    if (hasLoaded && !USE_SEED_DATA) {
      saveAppData(data);
    }
  }, [data, hasLoaded]);

  return (
    <AppContext.Provider value={{ data, isLoading, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
