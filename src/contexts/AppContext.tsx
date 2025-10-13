import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { CartItem, Product, ProductVariant, User } from '../types';
import { supabase } from '../lib/supabase';
import { useCart, useWishlist } from '../hooks/useSupabase';

interface AppState {
  user: User | null;
  isCartOpen: boolean;
  isMenuOpen: boolean;
  authLoading: boolean;
}

const initialState: AppState = {
  user: null,
  isCartOpen: false,
  isMenuOpen: false,
  authLoading: true,
};

type AppAction =
  | { type: 'TOGGLE_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'TOGGLE_MENU' }
  | { type: 'CLOSE_MENU' }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTH_LOADING'; payload: boolean };

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  cartItems: CartItem[];
  addToCart: (productId: string, quantity?: number, variantId?: string) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  cartLoading: boolean;
  cartError: string | null;
  toggleCart: () => void;
  closeCart: () => void;
  wishlistItems: any[];
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (wishlistItemId: string) => Promise<void>;
  wishlistLoading: boolean;
  wishlistError: string | null;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'TOGGLE_CART':
      console.log('appReducer: TOGGLE_CART - Before:', state.isCartOpen);
      const newCartState = { ...state, isCartOpen: !state.isCartOpen };
      console.log('appReducer: TOGGLE_CART - After:', newCartState.isCartOpen);
      return newCartState;
    case 'CLOSE_CART':
      return { ...state, isCartOpen: false };
    case 'TOGGLE_MENU':
      return { ...state, isMenuOpen: !state.isMenuOpen };
    case 'CLOSE_MENU':
      return { ...state, isMenuOpen: false };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_AUTH_LOADING':
      return { ...state, authLoading: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const {
    cartItems,
    loading: cartLoading,
    error: cartError,
    addToCart,
    removeFromCart,
    updateQuantity,
  } = useCart(state.user?.id || null);
  const {
    wishlistItems,
    loading: wishlistLoading,
    error: wishlistError,
    addToWishlist,
    removeFromWishlist,
  } = useWishlist(state.user?.id || null);

  useEffect(() => {
    async function getUserSession() {
      dispatch({ type: 'SET_AUTH_LOADING', payload: true });
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        dispatch({ type: 'SET_USER', payload: null });
        dispatch({ type: 'SET_AUTH_LOADING', payload: false });
        return;
      }
      if (session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('first_name, last_name, role')
          .eq('id', session.user.id)
          .maybeSingle(); // Changed from .single() to .maybeSingle()
        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          dispatch({ type: 'SET_USER', payload: null });
        } else {
          dispatch({
            type: 'SET_USER',
            payload: {
              id: session.user.id,
              email: session.user.email || '',
              firstName: profile?.first_name || '',
              lastName: profile?.last_name || '',
              role: profile?.role || 'customer',
              addresses: [],
              orders: [],
              wishlist: [],
            },
          });
        }
      } else {
        dispatch({ type: 'SET_USER', payload: null });
      }
      dispatch({ type: 'SET_AUTH_LOADING', payload: false });
    }
    getUserSession();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        supabase
          .from('user_profiles')
          .select('first_name, last_name, role')
          .eq('id', session.user.id)
          .maybeSingle() // Changed from .single() to .maybeSingle()
          .then(({ data: profile, error: profileError }) => {
            if (profileError) {
              console.error('Error fetching user profile on auth change:', profileError);
              dispatch({ type: 'SET_USER', payload: null });
            } else {
              dispatch({
                type: 'SET_USER',
                payload: {
                  id: session.user.id,
                  email: session.user.email || '',
                  firstName: profile?.first_name || '',
                  lastName: profile?.last_name || '',
                  role: profile?.role || 'customer',
                  addresses: [],
                  orders: [],
                  wishlist: [],
                },
              });
            }
          });
      } else {
        dispatch({ type: 'SET_USER', payload: null });
      }
      dispatch({ type: 'SET_AUTH_LOADING', payload: false });
    });
    return () => subscription.unsubscribe();
  }, []);

  const contextValue = React.useMemo(() => ({
    state,
    dispatch,
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    cartLoading,
    cartError,
    toggleCart: () => {
      console.log('Header Button: toggleCart function called');
      dispatch({ type: 'TOGGLE_CART' });
    },
    closeCart: () => dispatch({ type: 'CLOSE_CART' }),
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    wishlistLoading,
    wishlistError,
  }), [state, dispatch, cartItems, addToCart, removeFromCart, updateQuantity, cartLoading, cartError, wishlistItems, addToWishlist, removeFromWishlist, wishlistLoading, wishlistError]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}