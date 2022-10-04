import { Flex, Box, Text, Button } from '@chakra-ui/react';
import { useState, useEffect, useContext } from 'react';
import Web3 from 'web3';

import { Meta } from './Meta';
import { Header } from './Header';
import { Footer } from './Footer';

import { AppContext } from '../context/AppContext';
import { SUPPORTED_NETWORK_IDS } from '../config';

export const Layout = ({ children }) => {
  const context = useContext(AppContext);
  const [windowWidth, setWindowWidth] = useState('');

  const switchNetwork = async () => {
    try {
      await context.web3.currentProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: Web3.utils.toHex(5) }]
      });
    } catch (switchError) {
      console.log(switchError);
    }
  };

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    window.removeEventListener('resize', () => {});
    window.addEventListener('resize', (e) => {
      setWindowWidth(window.innerWidth);
    });
  }, []);

  return (
    <Box fontFamily='openSans' bg='white'>
      <Meta />
      <Flex
        direction='column'
        minH='100vh'
        maxW='70rem'
        alignItems='center'
        mx='auto'
      >
        <Header />
        {context.signerAddress ? (
          !(context.chainId in SUPPORTED_NETWORK_IDS) ? (
            <Flex direction='column' alignItems='center' my='auto'>
              <Box fontSize='40px' color='red'>
                <i className='fa-solid fa-circle-xmark'></i>
              </Box>
              <Text fontFamily='figTree' color='black' fontSize='1.2rem'>
                Unsupported network
              </Text>
              <Button
                onClick={switchNetwork}
                bg='black'
                color='white'
                fontFamily='openSans'
                mt='2rem'
                _hover={{ opacity: '0.8' }}
              >
                Switch to {SUPPORTED_NETWORK_IDS[5]}
              </Button>
            </Flex>
          ) : (
            windowWidth > 720 && children
          )
        ) : (
          windowWidth > 720 && children
        )}
        {windowWidth < 720 && (
          <Text fontFamily='figTree' fontSize='lg' my='auto'>
            Please use a larger screen!
          </Text>
        )}
        <Footer />
      </Flex>
    </Box>
  );
};
