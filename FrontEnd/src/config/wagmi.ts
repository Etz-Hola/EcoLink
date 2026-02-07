import { http, createConfig } from 'wagmi';
import { mainnet, celo, celoAlfajores } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
    chains: [mainnet, celo, celoAlfajores],
    connectors: [
        injected(),
    ],
    transports: {
        [mainnet.id]: http(),
        [celo.id]: http(),
        [celoAlfajores.id]: http(),
    },
});
