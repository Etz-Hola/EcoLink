import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { WalletState } from '../types';

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isConnecting: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

type WalletAction =
  | { type: 'CONNECT_START' }
  | { type: 'CONNECT_SUCCESS'; payload: { address: string; balance: string; chainId: number } }
  | { type: 'CONNECT_FAILURE' }
  | { type: 'DISCONNECT' };

const walletReducer = (state: WalletState & { isConnecting: boolean }, action: WalletAction) => {
  switch (action.type) {
    case 'CONNECT_START':
      return { ...state, isConnecting: true };
    case 'CONNECT_SUCCESS':
      return {
        ...state,
        isConnected: true,
        address: action.payload.address,
        balance: action.payload.balance,
        chainId: action.payload.chainId,
        isConnecting: false
      };
    case 'CONNECT_FAILURE':
      return {
        ...state,
        isConnected: false,
        address: null,
        balance: null,
        chainId: null,
        isConnecting: false
      };
    case 'DISCONNECT':
      return {
        ...state,
        isConnected: false,
        address: null,
        balance: null,
        chainId: null,
        isConnecting: false
      };
    default:
      return state;
  }
};

const initialState = {
  isConnected: false,
  address: null,
  balance: null,
  chainId: null,
  isConnecting: false
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  const connect = async (): Promise<void> => {
    dispatch({ type: 'CONNECT_START' });

    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });

        const chainId = await window.ethereum.request({
          method: 'eth_chainId'
        });

        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [accounts[0], 'latest']
        });

        // Convert balance from Wei to Ether
        const balanceInEth = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);

        dispatch({
          type: 'CONNECT_SUCCESS',
          payload: {
            address: accounts[0],
            balance: balanceInEth,
            chainId: parseInt(chainId, 16)
          }
        });

        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length === 0) {
            dispatch({ type: 'DISCONNECT' });
          } else {
            // Update with new account
            connect();
          }
        });

        // Listen for chain changes
        window.ethereum.on('chainChanged', () => {
          connect();
        });
      } else {
        throw new Error('No Ethereum wallet detected');
      }
    } catch (error) {
      dispatch({ type: 'CONNECT_FAILURE' });
      throw error;
    }
  };

  const disconnect = async (): Promise<void> => {
    dispatch({ type: 'DISCONNECT' });
  };

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connect,
        disconnect
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}

export { WalletContext }