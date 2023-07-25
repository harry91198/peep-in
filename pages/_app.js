import "../styles/globals.css";

import "@rainbow-me/rainbowkit/styles.css";
import { ChakraProvider } from '@chakra-ui/react'

import {
  apiProvider,
  getDefaultWallets,
  RainbowKitProvider,
  midnightTheme,
  darkTheme
} from "@rainbow-me/rainbowkit";
// import { createClient, WagmiProvider } from "wagmi";
import { createConfig, configureChains, WagmiConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { polygonMumbai, polygon } from "wagmi/chains";

import Layout from "../components/Layout";


// import chain from "wagmi/chains";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [polygonMumbai],
  [alchemyProvider({ apiKey: 'DK0duQ_IHjyhZ10vYp-gklUPTQCnjPHy' }), publicProvider()],
  // [apiProvider.fallback()]
);

const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  projectId: '8cbf2729fda29e8d02b29fb315cf0c57',
  chains,
});
const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})



function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <WagmiConfig config={config}>
        <RainbowKitProvider chains={chains} theme={darkTheme()} coolMode>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </RainbowKitProvider>
      </WagmiConfig>
    </ChakraProvider>
  );
}

export default MyApp;
