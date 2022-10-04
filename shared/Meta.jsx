import Head from 'next/head';

export const Meta = () => {
  return (
    <>
      <Head>
        <title>Handshake Trade</title>
        <meta
          name='description'
          content='Trade your erc20 peer to peer & trustless.'
        />
        <meta property='og:title' content='Handshake Trade' />
        <meta
          property='og:description'
          content='Trade your erc20 peer to peer & trustless.'
        />
        <meta property='og:type' content='website' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
    </>
  );
};
