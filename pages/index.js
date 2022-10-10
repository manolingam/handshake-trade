/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useContext } from 'react';
import {
  Flex,
  Input,
  NumberInput,
  NumberInputField,
  Tooltip,
  Text,
  Button,
  FormControl,
  FormLabel,
  Tag,
  useToast,
  Box,
  SimpleGrid,
  Link as ChakraLink,
  HStack
} from '@chakra-ui/react';
import { utils } from 'ethers';
import { useRouter } from 'next/router';

import { AppContext } from '../context/AppContext';
import RadioBox from '../shared/RadioBox';
import { CONTRACT_ADDRESSES } from '../utils/constants';
import {
  getTokenBalance,
  getTokenTicker,
  getAllowance,
  approveSpender,
  createTrade,
  getLatestTradeId
} from '../utils/web3';

const UNIX_PER_MINUTE = 60;

export default function Home() {
  const context = useContext(AppContext);
  const toast = useToast();
  const router = useRouter();

  const [expiryDuration, setExpiryDuration] = useState('5');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [tradeWith, setTradeWith] = useState({
    tokenAddress: '',
    numberOfTokens: '',
    isValidErc20: false,
    tokenTicker: '',
    walletBalance: 0,
    spendAllowance: 0
  });
  const [tradeFor, setTradeFor] = useState({
    tokenAddress: '',
    numberOfTokens: '',
    isValidErc20: false,
    tokenTicker: '',
    walletBalance: 0,
    spendAllowance: 0
  });

  const [txHash, setTxHash] = useState('');
  const [needAllowance, setNeedAllowance] = useState(false);
  const [loading, setLoading] = useState(false);

  const [latestTradeId, setLatestTradeId] = useState(null);

  const setAllowance = async () => {
    setLoading(true);
    try {
      const tx = await approveSpender(
        context.ethersProvider,
        tradeWith.tokenAddress,
        CONTRACT_ADDRESSES[context.chainId],
        utils.parseUnits(tradeWith.numberOfTokens, 'ether')
      );
      if (tx) {
        triggerToast('transaction started..');
        setTxHash(tx.hash);
        const { status } = await tx.wait();
        if (status === 1) {
          const allowance = await getAllowance(
            context.ethersProvider,
            tradeWith.tokenAddress,
            context.signerAddress,
            CONTRACT_ADDRESSES[context.chainId]
          );
          setTradeWith((prevState) => ({
            ...prevState,
            spendAllowance: Number(utils.formatEther(allowance)).toFixed(0)
          }));
          setNeedAllowance(false);
          setTxHash('');
        } else {
          console.log('Transaction failed');
        }
      }
    } catch (err) {
      console.log(err);
      triggerToast('transaction cancelled..');
    }
    setLoading(false);
  };

  const createOffer = async () => {
    if (!tradeWith.isValidErc20)
      return triggerToast('Offered token is not ERC20.');
    if (!tradeFor.isValidErc20)
      return triggerToast('Required token is not ERC20.');
    if (tradeWith.tokenAddress === tradeFor.tokenAddress)
      return triggerToast('Required & offered token cannot be same.');
    if (context.signerAddress.toLowerCase() === receiverAddress.toLowerCase())
      return triggerToast('Cannot trade with the same address.');
    if (Number(tradeWith.numberOfTokens) > Number(tradeWith.walletBalance))
      return triggerToast('Tokens offered exceeds your balance.');
    if (Number(tradeWith.numberOfTokens) > Number(tradeWith.spendAllowance))
      return setNeedAllowance(true);

    try {
      const tx = await createTrade(
        context.ethersProvider,
        CONTRACT_ADDRESSES[context.chainId],
        tradeWith.tokenAddress,
        utils.parseUnits(tradeWith.numberOfTokens, 'ether'),
        receiverAddress,
        tradeFor.tokenAddress,
        utils.parseUnits(tradeFor.numberOfTokens, 'ether'),
        Number(expiryDuration) * UNIX_PER_MINUTE
      );
      if (tx) {
        triggerToast('transaction started..');
        setTxHash(tx.hash);
        const { status } = await tx.wait();
        if (status === 1) {
          triggerToast('trade successfully created.');
          setTxHash('');
          const _tradeId = await getLatestTradeId(
            context.ethersProvider,
            CONTRACT_ADDRESSES[context.chainId]
          );
          setLatestTradeId(Number(_tradeId));
        }
      }
    } catch (err) {
      console.log(err);
      triggerToast('transaction cancelled..');
    }
  };

  const triggerToast = (_message) => {
    toast({
      position: 'bottom-left',
      render: () => (
        <Box
          color='black'
          fontFamily='figTree'
          p={3}
          bg='white'
          border='2px solid black'
          borderRadius='10px'
        >
          <i className='fa-solid fa-circle-exclamation'></i> {_message}
        </Box>
      )
    });
  };

  const queryTokenMeta = async (_tokenAddress, _setState) => {
    let _isValidErc20 = false;
    let _spendAllowance = 0;
    let _walletBalance = 0;
    let _tokenTicker = 0;
    try {
      _walletBalance = await getTokenBalance(
        context.ethersProvider,
        context.signerAddress,
        _tokenAddress
      );
      _tokenTicker = await getTokenTicker(
        context.ethersProvider,
        _tokenAddress
      );
      _spendAllowance = await getAllowance(
        context.ethersProvider,
        _tokenAddress,
        context.signerAddress,
        CONTRACT_ADDRESSES[context.chainId]
      );
      _isValidErc20 = true;
    } catch (err) {
      console.log(err);
      triggerToast('Invalid token address');
    }

    _setState((prevState) => ({
      ...prevState,
      isValidErc20: _isValidErc20,
      spendAllowance: Number(utils.formatEther(_spendAllowance)).toFixed(0),
      walletBalance: Number(utils.formatEther(_walletBalance)).toFixed(0),
      tokenTicker: _tokenTicker
    }));
  };

  useEffect(() => {
    if (utils.isAddress(tradeWith.tokenAddress) && context.signerAddress) {
      queryTokenMeta(tradeWith.tokenAddress, setTradeWith);
    } else
      setTradeWith((prevState) => ({
        ...prevState,
        isValidErc20: false,
        spendAllowance: 0,
        walletBalance: 0,
        tokenTicker: ''
      }));
    setNeedAllowance(false);
  }, [tradeWith.tokenAddress]);

  useEffect(() => {
    if (utils.isAddress(tradeFor.tokenAddress) && context.signerAddress)
      queryTokenMeta(tradeFor.tokenAddress, setTradeFor);
    else
      setTradeFor((prevState) => ({
        ...prevState,
        isValidErc20: false,
        walletBalance: 0,
        spendAllowance: 0,
        tokenTicker: ''
      }));
  }, [tradeFor.tokenAddress]);

  return (
    <Flex w='80%' direction='column' alignItems='center'>
      {!latestTradeId && (
        <>
          <Text
            fontFamily='figTree'
            mr='auto'
            mt='2rem'
            mb='10px'
            fontSize='1.2rem'
          >
            Trade any erc20 with any other erc20 peer to peer with your friend
            or anyone trustless.
          </Text>

          <Text
            fontFamily='figTree'
            mr='auto'
            color='#0057B7'
            fontSize='.8rem'
            fontStyle='italic'
          >
            A Trade Fee of 0.003 eth is required for all trades & the proceeds
            are donated to UkraineDAO.
          </Text>

          <SimpleGrid w='100%' columns='2' gap='1rem'>
            <Flex
              w='100%'
              direction='column'
              bg='white'
              boxShadow='rgb(0 0 0 / 1%) 0px 0px 1px, rgb(0 0 0 / 4%) 0px 4px 8px, rgb(0 0 0 / 4%) 0px 16px 24px, rgb(0 0 0 / 1%) 0px 24px 32px'
              borderRadius='1rem'
              p='2rem'
            >
              <Flex direction='row' alignItems='center'>
                <Text
                  fontFamily='figTree'
                  color='blackDark'
                  py='1rem'
                  mr='10px'
                  fontSize='1rem'
                  fontWeight='bold'
                >
                  Trade with
                </Text>
                <Tooltip label='The token you want to sell' placement='right'>
                  <i className='fa-solid fa-circle-question'></i>
                </Tooltip>
              </Flex>
              <Flex direction='row'>
                <Input
                  placeholder='ERC20 address'
                  border='none'
                  bg='rgb(247, 248, 250)'
                  onChange={(e) => {
                    setTradeWith((prevState) => ({
                      ...prevState,
                      tokenAddress: e.target.value
                    }));
                    setNeedAllowance(false);
                  }}
                  mr='10px'
                  fontSize='.8rem'
                />
                <NumberInput min={1} maxW={24}>
                  <NumberInputField
                    placeholder='Qty'
                    border='none'
                    bg='rgb(247, 248, 250)'
                    onChange={(e) => {
                      setTradeWith((prevState) => ({
                        ...prevState,
                        numberOfTokens: e.target.value
                      }));
                      setNeedAllowance(false);
                    }}
                    fontSize='.8rem'
                  />
                </NumberInput>
              </Flex>

              <Tag
                ml='auto'
                mt='5px'
                fontFamily='figTree'
              >{`Your balance: ${tradeWith.walletBalance} ${tradeWith.tokenTicker}`}</Tag>
            </Flex>

            <Flex
              w='100%'
              direction='column'
              bg='white'
              boxShadow='rgb(0 0 0 / 1%) 0px 0px 1px, rgb(0 0 0 / 4%) 0px 4px 8px, rgb(0 0 0 / 4%) 0px 16px 24px, rgb(0 0 0 / 1%) 0px 24px 32px'
              borderRadius='1rem'
              p='2rem'
            >
              <Flex direction='row' alignItems='center'>
                <Text
                  fontFamily='figTree'
                  color='blackDark'
                  py='1rem'
                  mr='10px'
                  fontSize='1rem'
                  fontWeight='bold'
                >
                  Trade for
                </Text>
                <Tooltip label='The token you want to buy.' placement='right'>
                  <i className='fa-solid fa-circle-question'></i>
                </Tooltip>
              </Flex>
              <Flex direction='row'>
                <Input
                  placeholder='ERC20 address'
                  border='none'
                  bg='rgb(247, 248, 250)'
                  onChange={(e) => {
                    setTradeFor((prevState) => ({
                      ...prevState,
                      tokenAddress: e.target.value
                    }));
                    setNeedAllowance(false);
                  }}
                  mr='10px'
                  fontSize='.8rem'
                />
                <NumberInput min={1} maxW={24}>
                  <NumberInputField
                    placeholder='Qty'
                    border='none'
                    bg='rgb(247, 248, 250)'
                    onChange={(e) => {
                      setTradeFor((prevState) => ({
                        ...prevState,
                        numberOfTokens: e.target.value
                      }));
                      setNeedAllowance(false);
                    }}
                    fontSize='.8rem'
                  />
                </NumberInput>
              </Flex>

              <Tag
                ml='auto'
                mt='5px'
                fontFamily='figTree'
              >{`Your balance: ${tradeFor.walletBalance} ${tradeFor.tokenTicker}`}</Tag>
            </Flex>
          </SimpleGrid>

          <Flex
            w='100%'
            direction='row'
            justifyContent='space-between'
            alignItems='center'
          >
            <FormControl
              isRequired
              fontFamily='figTree'
              color='black'
              py='1rem'
            >
              <FormLabel as='legend'>
                Trade expiry duration (in minutes)
              </FormLabel>
              <RadioBox
                stack='horizontal'
                options={['5', '15', '30']}
                updateRadio={setExpiryDuration}
                name='expiry_duration'
                defaultValue={expiryDuration}
                value={expiryDuration}
              />
            </FormControl>

            <FormControl
              isRequired
              fontFamily='figTree'
              color='black'
              py='1rem'
            >
              <FormLabel as='legend'>Address of the receiver</FormLabel>
              <Input
                placeholder='Wallet address'
                border='none'
                bg='rgb(247, 248, 250)'
                onChange={(e) => {
                  setReceiverAddress(e.target.value);
                  setNeedAllowance(false);
                }}
                mr='10px'
                fontSize='.8rem'
              />
            </FormControl>
          </Flex>

          {!needAllowance && (
            <Button
              mt='1rem'
              ml='auto'
              bg='black'
              color='white'
              isDisabled={
                !context.signerAddress ||
                !utils.isAddress(tradeWith.tokenAddress) ||
                !tradeWith.numberOfTokens ||
                !utils.isAddress(receiverAddress) ||
                !utils.isAddress(tradeFor.tokenAddress) ||
                !tradeFor.numberOfTokens
              }
              isLoading={loading}
              onClick={async () => {
                setLoading(true);
                await createOffer();
                setLoading(false);
              }}
              _hover={{
                opacity: 0.8
              }}
            >
              Create Offer
            </Button>
          )}

          {needAllowance && (
            <Button
              mt='1rem'
              ml='auto'
              bg='black'
              color='white'
              onClick={setAllowance}
              isLoading={loading}
              _hover={{
                opacity: 0.8
              }}
            >
              {`Approve ${tradeWith.tokenTicker}`}
            </Button>
          )}

          <ChakraLink
            href={`https://goerli.etherscan.io/tx/${txHash}`}
            isExternal
            ml='auto'
            textDecoration='underline'
            fontFamily='openSans'
            px='2'
            py='1'
            mt='1rem'
            fontSize='.8rem'
            visibility={txHash ? 'visible' : 'hidden'}
          >
            View transaction..
          </ChakraLink>
        </>
      )}

      {latestTradeId && (
        <>
          <Text fontFamily='openSans' mt='2rem' fontSize='1.5rem'>
            Trade created successfully!
          </Text>
          <HStack gap='1' mt='2rem'>
            <Button
              bg='black'
              color='white'
              onClick={() => router.push(`/trade/${latestTradeId - 1}`)}
              _hover={{
                opacity: 0.8
              }}
            >
              View trade
            </Button>
            <Button
              bg='black'
              color='white'
              onClick={() => router.push('/dashboard')}
              _hover={{
                opacity: 0.8
              }}
            >
              View all trades
            </Button>
            <Button
              color='white'
              bg='black'
              onClick={() => setLatestTradeId(null)}
              _hover={{
                opacity: 0.8
              }}
            >
              New trade
            </Button>
          </HStack>
        </>
      )}
    </Flex>
  );
}
