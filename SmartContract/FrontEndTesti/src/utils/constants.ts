export const MATERIAL_CATEGORIES = [
  {
    id: 'plastics',
    name: 'Plastics',
    subcategories: ['PET Bottles', 'HDPE', 'PVC', 'LDPE', 'PP', 'PS', 'Others'],
    basePrice: 150,
    unit: 'kg' as const,
    description: 'All plastic materials including bottles, containers, and packaging'
  },
  {
    id: 'metals',
    name: 'Metals',
    subcategories: ['Aluminum Cans', 'Iron/Steel', 'Copper', 'Brass', 'Mixed Metals'],
    basePrice: 200,
    unit: 'kg' as const,
    description: 'Ferrous and non-ferrous metal materials'
  },
  {
    id: 'paper',
    name: 'Paper & Cardboard',
    subcategories: ['Newspapers', 'Magazines', 'Cardboard', 'Office Paper', 'Books'],
    basePrice: 80,
    unit: 'kg' as const,
    description: 'Paper products and cardboard materials'
  },
  {
    id: 'glass',
    name: 'Glass',
    subcategories: ['Clear Glass', 'Colored Glass', 'Bottles', 'Jars'],
    basePrice: 60,
    unit: 'kg' as const,
    description: 'Glass containers and materials'
  },
  {
    id: 'electronics',
    name: 'Electronics',
    subcategories: ['Mobile Phones', 'Computers', 'TVs', 'Small Appliances', 'Batteries'],
    basePrice: 500,
    unit: 'piece' as const,
    description: 'Electronic devices and components'
  }
];

export const CONDITION_MULTIPLIERS = {
  clean: 1.0,
  dirty: 0.7,
  treated: 1.2,
  untreated: 0.8
};

export const QUALITY_GRADES = {
  A: { multiplier: 1.2, label: 'Premium Quality' },
  B: { multiplier: 1.0, label: 'Good Quality' },
  C: { multiplier: 0.8, label: 'Fair Quality' },
  D: { multiplier: 0.6, label: 'Poor Quality' }
};

export const USER_ROLES = {
  collector: 'Collector',
  branch: 'Branch Manager',
  admin: 'Administrator',
  buyer: 'Bulk Buyer'
};

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ecolink';
export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'ecolink';

export const SUPPORTED_CHAINS = [
  {
    id: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.infura.io/v3/'],
    blockExplorerUrls: ['https://etherscan.io']
  },
  {
    id: 137,
    name: 'Polygon',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com']
  }
];

export const LOGISTICS_COSTS = {
  local: 50, // per kg
  interstate: 100, // per kg
  express: 150 // per kg
};

export const ECO_POINTS_RATE = 10; // points per kg of material recycled