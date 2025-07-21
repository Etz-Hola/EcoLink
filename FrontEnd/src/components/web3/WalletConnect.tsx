import React, { useState } from 'react';
import { Wallet, CheckCircle, AlertCircle } from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';
import { truncateAddress } from '../../utils/helpers';
import Button from '../common/Button';
import Modal from '../common/Modal';

interface WalletConnectProps {
  isOpen?: boolean;
  onClose?: () => void;
  showAsModal?: boolean;
}

const WalletConnect: React.FC<WalletConnectProps> = ({
  isOpen = false,
  onClose,
  showAsModal = false
}) => {
  const { isConnected, address, balance, isConnecting, connect, disconnect } = useWallet();
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      setError(null);
      await connect();
    } catch (err) {
      setError('Failed to connect wallet. Please try again.');
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      if (onClose) onClose();
    } catch (err) {
      setError('Failed to disconnect wallet.');
    }
  };

  const WalletContent = () => (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      {!isConnected ? (
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Wallet className="w-8 h-8 text-green-600" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-gray-600">
              Connect your Web3 wallet to access blockchain features like EcoPoints and NFT rewards.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleConnect}
              isLoading={isConnecting}
              fullWidth
              leftIcon={<Wallet className="h-4 w-4" />}
            >
              Connect Wallet
            </Button>
            
            <p className="text-xs text-gray-500">
              By connecting your wallet, you agree to our Web3 terms and conditions
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">Wallet Connected</span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Address:</span>
              <span className="font-mono text-sm">{truncateAddress(address || '')}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Balance:</span>
              <span className="font-medium">{balance} ETH</span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Network:</span>
              <span className="font-medium">Ethereum Mainnet</span>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Web3 Features Unlocked</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Earn EcoPoints as blockchain tokens</li>
              <li>• Receive NFT certificates for contributions</li>
              <li>• Access to exclusive Web3 rewards</li>
              <li>• Participate in governance voting</li>
            </ul>
          </div>

          <Button
            onClick={handleDisconnect}
            variant="outline"
            fullWidth
          >
            Disconnect Wallet
          </Button>
        </div>
      )}
    </div>
  );

  if (showAsModal) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose || (() => {})}
        title="Web3 Wallet"
        size="md"
      >
        <WalletContent />
      </Modal>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <WalletContent />
    </div>
  );
};

export default WalletConnect;