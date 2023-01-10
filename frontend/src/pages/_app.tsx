import { ApolloProvider } from "@apollo/client";
import { ChakraProvider } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";

import { client } from "../graphql/apollo-client";
import { theme } from "../theme";

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <SessionProvider session={session}>
        <ChakraProvider theme={theme} cssVarsRoot="body">
          <Component {...pageProps} />
          <Toaster />
        </ChakraProvider>
      </SessionProvider>
    </ApolloProvider>
  );
}

export default MyApp;
