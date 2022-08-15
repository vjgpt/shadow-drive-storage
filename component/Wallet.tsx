import React, { FC, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  CoinbaseWalletAdapter,
  GlowWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import {
  WalletModalProvider,
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

export const Wallet = ({
  children
}: {
  children: React.ReactNode;
}) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = 'https://ssc-dao.genesysgo.net/';

  const wallets = useMemo(
      () => [
          new PhantomWalletAdapter(),
      ],
      []
  );

  return (
      <ConnectionProvider endpoint={network} config={{ commitment: "max"}}>
          <WalletProvider wallets={wallets} autoConnect>
              <WalletModalProvider>
                <div style={{ position: 'absolute', top: 0, right: 0, padding: 10 }}>
                  <WalletMultiButton />
                </div>
                  {children}
              </WalletModalProvider>
          </WalletProvider>
      </ConnectionProvider>
  );
};