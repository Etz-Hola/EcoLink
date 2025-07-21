import React from 'react';
import { Leaf, TrendingUp, Gift, Trophy } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useWallet } from '../../hooks/useWallet';

const EcoPointsDisplay: React.FC = () => {
  const { user } = useAuth();
  const { isConnected } = useWallet();

  // Mock data - replace with real blockchain data
  const ecoPoints = user?.ecoPoints || 0;
  const monthlyEarnings = 450;
  const totalContributions = 23.5; // kg
  const rank = 156;

  const achievements = [
    { id: 1, name: 'First Upload', icon: '🎯', earned: true },
    { id: 2, name: 'Plastic Warrior', icon: '♻️', earned: true },
    { id: 3, name: 'Metal Master', icon: '🏆', earned: false },
    { id: 4, name: 'Eco Champion', icon: '🌟', earned: false }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Leaf className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">EcoPoints</h3>
        </div>
        {isConnected && (
          <div className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
            Web3 Enabled
          </div>
        )}
      </div>

      {/* Points Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Points</p>
              <p className="text-2xl font-bold text-green-900">{ecoPoints.toLocaleString()}</p>
            </div>
            <Leaf className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">This Month</p>
              <p className="text-2xl font-bold text-blue-900">+{monthlyEarnings}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Materials (kg)</p>
              <p className="text-2xl font-bold text-purple-900">{totalContributions}</p>
            </div>
            <Gift className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Global Rank</p>
              <p className="text-2xl font-bold text-yellow-900">#{rank}</p>
            </div>
            <Trophy className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Achievements</h4>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-3 rounded-lg border-2 ${
                achievement.earned
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{achievement.icon}</span>
                <span className={`text-sm font-medium ${
                  achievement.earned ? 'text-green-900' : 'text-gray-500'
                }`}>
                  {achievement.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Web3 Features */}
      {isConnected && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Web3 Rewards</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Token Balance:</span>
              <span className="font-medium">{ecoPoints} ECO</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">NFT Certificates:</span>
              <span className="font-medium">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Staking Rewards:</span>
              <span className="font-medium text-green-600">+2.5% APY</span>
            </div>
          </div>
        </div>
      )}

      {/* Call to Action */}
      {!isConnected && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-sm text-blue-700 mb-2">
              Connect your wallet to unlock Web3 features and earn token rewards!
            </p>
            <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
              Connect Wallet →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EcoPointsDisplay;