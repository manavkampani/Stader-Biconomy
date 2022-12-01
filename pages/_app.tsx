import "../styles/globals.css";
import type { AppProps } from "next/app";

import { createClient, configureChains, WagmiConfig } from "wagmi";
import { bsc } from "wagmi/chains";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import {
  BinanceWalletConnector,
  SafePalWalletConnector,
} from "../connectors/connectors";

const { chains, provider } = configureChains(
  [bsc],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id !== bsc.id) return null;
        return { http: "https://bscrpc.com" };
      },
    }),
  ]
);

const client = createClient({
  autoConnect: true,
  provider,
  connectors: [
    new MetaMaskConnector({
      chains,
      options: {
        shimDisconnect: true,
        shimChainChangedDisconnect: false,
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        qrcode: true,
        chainId: bsc.id,
      },
    }),
    new CoinbaseWalletConnector({
      options: {
        appName: "Test App",
      },
    }),
    new BinanceWalletConnector({
      chains,
      options: {
        shimDisconnect: true,
      },
    }),
    new SafePalWalletConnector({
      chains,
      options: {
        shimDisconnect: true,
      },
    }),
  ],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={client}>
      <Component {...pageProps} />
    </WagmiConfig>
  );
}
