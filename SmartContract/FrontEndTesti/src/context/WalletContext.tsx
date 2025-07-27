import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { WalletState } from '../types';
import { ethers } from 'ethers';
import WalletConnectProvider from '@walletconnect/web3-provider';
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import Web3Modal from 'web3modal';

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

let web3Modal: Web3Modal | null = null;

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: process.env.VITE_INFURA_ID || '',
    },
  },
  coinbasewallet: {
    package: CoinbaseWalletSDK,
    options: {
      appName: 'EcoLink Waste',
      infuraId: process.env.VITE_INFURA_ID || '',
      rpc: '',
      chainId: 1,
      darkMode: false
    },
  },
};

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  const connect = async (): Promise<void> => {
    dispatch({ type: 'CONNECT_START' });
    try {
      if (!web3Modal) {
        web3Modal = new Web3Modal({
          cacheProvider: true,
          providerOptions,
        });
      }
      const instance = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(instance);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      const chainId = (await provider.getNetwork()).chainId;
      dispatch({
        type: 'CONNECT_SUCCESS',
        payload: {
          address,
          balance: ethers.utils.formatEther(balance),
          chainId,
        },
      });
      // Listen for account and network changes
      instance.on('accountsChanged', () => connect());
      instance.on('chainChanged', () => connect());
      instance.on('disconnect', () => disconnect());
    } catch (error) {
      dispatch({ type: 'CONNECT_FAILURE' });
      throw error;
    }
  };

  const disconnect = async (): Promise<void> => {
    if (web3Modal) {
      await web3Modal.clearCachedProvider();
    }
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
// (No longer needed for web3modal, but kept for compatibility)
declare global {
  interface Window {
    ethereum?: any;
  }
}

export { WalletContext }