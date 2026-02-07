import React, { createContext, ReactNode } from 'react';
import { useAccount, useConnect, useDisconnect, useBalance, useChainId } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { WalletState } from '../types';

export interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isConnecting: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const { address, isConnected, isConnecting } = useAccount();
  const { connectAsync } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { data: balanceData } = useBalance({ address: address as `0x${string}` | undefined });

  const handleConnect = async (): Promise<void> => {
    try {
      await connectAsync({ connector: injected() });
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      if (error.message?.includes('wallet must has at least one account')) {
        throw new Error('MetaMask is locked or has no accounts. Please unlock it and ensure you have an account created.');
      }
      throw error;
    }
  };

  const handleDisconnect = async (): Promise<void> => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Wallet disconnection failed:', error);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address: address || null,
        balance: balanceData ? `${(Number(balanceData.value) / 10 ** balanceData.decimals).toFixed(4)} ${balanceData.symbol}` : null,
        chainId: chainId || null,
        isConnecting,
        connect: handleConnect,
        disconnect: handleDisconnect
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export { WalletContext }
