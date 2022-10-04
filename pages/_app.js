import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import Router from 'next/router';
import nProgress from 'nprogress';

import AppContextProvider from '../context/AppContext';
import { Layout } from '../shared/Layout';

import '../styles/globals.css';

const breakpoints = {
  base: '320px',
  md: '620px',
  lg: '1020px'
};

const colors = {
  blackDark: '#2C3333',
  englishBlue: '#395B64',
  englishBlueLight: '#A5C9CA',
  englishBlueLighter: '#E7F6F2'
};

const fonts = {
  figTree: "'Figtree', sans-serif",
  openSans: "'Open Sans', sans-serif"
};

const theme = extendTheme({
  colors,
  fonts,
  breakpoints
});

import '../styles/nprogress.css';

Router.events.on('routeChangeStart', () => nProgress.start());
Router.events.on('routeChangeComplete', () => nProgress.done());
Router.events.on('routeChangeError', () => nProgress.done());

function MyApp({ Component, pageProps }) {
  return (
    <AppContextProvider>
      <ChakraProvider theme={theme}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ChakraProvider>
    </AppContextProvider>
  );
}

export default MyApp;
