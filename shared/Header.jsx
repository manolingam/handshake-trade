import {
  Flex,
  Box,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  useDisclosure,
  VStack,
  HStack
} from '@chakra-ui/react';
import Link from 'next/link';
import styled from '@emotion/styled';
import { useContext, useEffect, useRef, useState } from 'react';
import * as EpnsAPI from '@epnsproject/sdk-restapi';

import { AppContext } from '../context/AppContext';
import { useWallet } from '../hooks/useWallet';

import { SUPPORTED_NETWORK_IDS } from '../config';

const getAccountString = (account) => {
  const len = account.length;
  return `0x${account.substr(2, 3).toUpperCase()}...${account
    .substr(len - 3, len - 1)
    .toUpperCase()}`;
};

const StyledPrimaryButton = styled(Button)`
  min-width: 160px;
  height: 50px;
  color: white;
  background-color: black;
  border-radius: 2px;
  padding-left: 24px;
  padding-right: 24px;
`;

export const Header = () => {
  const context = useContext(AppContext);
  const { connectWallet, disconnect } = useWallet();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef();

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const getNotifications = async () => {
      const notifications = await EpnsAPI.user.getFeeds({
        user: `eip155:42:${context.signerAddress}`, // user address in CAIP
        env: 'staging'
      });

      setNotifications(notifications);
    };
    if (context.signerAddress) {
      getNotifications();
    }
  }, [context.signerAddress]);

  return (
    <Flex
      w='100%'
      alignItems='center'
      justifyContent='space-between'
      px='2rem'
      py='1rem'
      boxShadow='0px 2px 10px rgba(0, 70, 145, 0.2)'
    >
      <Link href='/' passHref>
        <Flex alignItems='center' cursor='pointer'>
          <Box fontSize='25px' mr='10px'>
            <i className='fa-solid fa-handshake'></i>
          </Box>
          <Text
            fontFamily='figTree'
            fontWeight='bold'
            fontSize={{ lg: '1.2rem', sm: '1rem' }}
          >
            Handshake Trade
          </Text>
        </Flex>
      </Link>

      {!context.signerAddress && (
        <StyledPrimaryButton onClick={connectWallet} fontFamily='openSans'>
          Connect wallet
        </StyledPrimaryButton>
      )}

      {context.signerAddress && (
        <Flex justify='center' align='center' zIndex={5} fontFamily='openSans'>
          {context.signerAddress && (
            <Button ref={btnRef} onClick={onOpen} mr='25px'>
              <i className='fa-solid fa-bell'></i>
            </Button>
          )}
          <Text color='black' fontFamily='figTree' mr='1rem' fontSize='.8rem'>
            {SUPPORTED_NETWORK_IDS[context.chainId]}
          </Text>
          <Popover placement='bottom'>
            <PopoverTrigger>
              <Button
                h='auto'
                fontWeight='bold'
                border='2px solid black'
                _hover={{ opacity: '0.8' }}
                p={{ base: 0, md: 3 }}
              >
                <Text
                  px={2}
                  display={{ md: 'flex' }}
                  fontFamily='figTree'
                  color='black'
                >
                  {getAccountString(context.signerAddress)}
                </Text>
              </Button>
            </PopoverTrigger>
            <PopoverContent bg='none' w='auto' border='none'>
              <Link href='/dashboard' passhref>
                <Button bg='black' color='white' fontFamily='figTree' mt='5px'>
                  My Trades
                </Button>
              </Link>
              <Button
                bg='black'
                color='white'
                fontFamily='figTree'
                onClick={() => {
                  disconnect();
                }}
                mt='5px'
              >
                Disconnect
              </Button>
            </PopoverContent>
          </Popover>
        </Flex>
      )}

      <Drawer
        isOpen={isOpen}
        placement='right'
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Your notifications</DrawerHeader>

          <DrawerBody>
            {notifications.map((notification, index) => {
              return (
                <Link
                  key={index}
                  href={`/trade/${notification.message}`}
                  passHref
                >
                  <HStack
                    bg='white'
                    boxShadow='rgb(0 0 0 / 1%) 0px 0px 1px, rgb(0 0 0 / 4%) 0px 4px 8px, rgb(0 0 0 / 4%) 0px 16px 24px, rgb(0 0 0 / 1%) 0px 24px 32px'
                    my='10px'
                    p='10px'
                    justifyContent='space-between'
                    borderRadius='5px'
                    cursor='pointer'
                    _hover={{
                      bg: 'black',
                      color: 'white'
                    }}
                  >
                    <Text
                      fontFamily='figTree'
                      fontWeight='bold'
                    >{`Trade #${notification.message}`}</Text>
                    <Text fontFamily='openSans' fontSize='.8rem'>
                      New Trade requested
                    </Text>
                  </HStack>
                </Link>
              );
            })}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
};
