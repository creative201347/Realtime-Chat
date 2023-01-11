import type { NextPage, NextPageContext } from "next";
import Head from "next/head";

import { getSession, useSession } from "next-auth/react";
import { Box } from "@chakra-ui/react";

import Chat from "../components/chat/Chat";
import Auth from "../components/auth/Auth";

const Home: NextPage = ({}) => {
  const { data: session } = useSession();

  const reloadSession = () => {
    const event = new Event("visibilitychange");
    document.dispatchEvent(event);
  };

  return (
    <>
      <Head>
        <title>Creative Nepal</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box>
        {session?.user.username ? (
          <Chat session={session} />
        ) : (
          <Auth session={session} reloadSession={reloadSession} />
        )}
      </Box>
    </>
  );
};

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);

  return {
    props: {
      session,
    },
  };
}

export default Home;
