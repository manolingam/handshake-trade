/* eslint-disable react-hooks/exhaustive-deps */
import {
  Flex,
  HStack,
  Text,
  Button,
  Link as ChakraLink,
  Box,
  useToast,
  Spinner,
  Tag
} from '@chakra-ui/react';
import { useState, useEffect, useContext } from 'react';
import { utils } from 'ethers';

import { SUBGRAPH_CLIENT } from '../../graphql/client';
import { TRADE_WITH_ID_QUERY } from '../../graphql/queries';
import { AppContext } from '../../context/AppContext';
import { CONTRACT_ADDRESSES } from '../../utils/constants';
import {
  claimStakeBack,
  finishTrade,
  approveSpender,
  getAllowance,
  getTokenBalance,
  getTokenTicker
} from '../../utils/web3';

const getAccountString = (account) => {
  const len = account.length;
  return `0x${account.substr(2, 8).toUpperCase()}...${account
    .substr(len - 3, len - 1)
    .toUpperCase()}`;
};

export async function getServerSideProps(context) {
  return {
    props: {
      tradeId: context.params.tradeId
    }
  };
}

const Trade = ({ tradeId }) => {
  const toast = useToast();
  const context = useContext(AppContext);

  const [trade, setTrade] = useState('');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [walletBalance, setWalletBalance] = useState(0);
  const [spendAllowance, setSpendAllowance] = useState(0);
  const [needAllowance, setNeedAllowance] = useState(false);

  const [offeredTokenTicker, setOfferedTokenTicker] = useState('');
  const [requiredTokenTicker, setRequiredTokenTicker] = useState('');

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

  const pollSubgraph = async (_tradeId, _expectedTradeStatus) => {
    let isSubscribed = true;
    setFetching(true);

    const interval = setInterval(async () => {
      const {
        data: { trades }
      } = await SUBGRAPH_CLIENT.query({
        query: TRADE_WITH_ID_QUERY,
        variables: {
          tradeId: Number(_tradeId)
        }
      });

      if (isSubscribed && trades[0].tradeStatus === _expectedTradeStatus) {
        isSubscribed = false;
        clearInterval(interval);
        fetchTrade();
      }
    }, 5000);
  };

  const fetchTrade = async () => {
    setFetching(true);
    const {
      data: { trades }
    } = await SUBGRAPH_CLIENT.query({
      query: TRADE_WITH_ID_QUERY,
      variables: { tradeId: Number(tradeId) }
    });

    if (
      trades[0].receiverAddress.toLowerCase() !==
        context.signerAddress.toLowerCase() &&
      trades[0].offerProviderAddress.toLowerCase() !==
        context.signerAddress.toLowerCase()
    ) {
      triggerToast('Not a trade participant!');
    } else {
      setTrade(trades[0]);
    }
    setFetching(false);
  };

  const withdrawStake = async (_tradeId) => {
    setLoading(true);
    try {
      const tx = await claimStakeBack(
        context.ethersProvider,
        CONTRACT_ADDRESSES[context.chainId],
        Number(_tradeId)
      );
      if (tx) {
        triggerToast('transaction started..');
        setTxHash(tx.hash);
        const { status } = await tx.wait();
        if (status === 1) {
          triggerToast('stake withdrawn successfully.');
          setTxHash('');
          pollSubgraph(_tradeId, 'Withdrawn');
        }
      }
    } catch (err) {
      console.log(err);
      triggerToast('transaction cancelled..');
    }
    setLoading(false);
  };

  const setAllowance = async () => {
    setLoading(true);
    try {
      const tx = await approveSpender(
        context.ethersProvider,
        trade.requiredTokenAddress,
        CONTRACT_ADDRESSES[context.chainId],
        trade.numberOfRequiredTokens
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
          setSpendAllowance(Number(utils.formatEther(allowance)).toFixed(0));
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

  const executeTrade = async (_tradeId) => {
    if (
      Number(utils.formatEther(trade.numberOfRequiredTokens)).toFixed(0) >
      Number(walletBalance)
    )
      return triggerToast('Tokens required exceeds your balance.');
    if (
      Number(utils.formatEther(trade.numberOfRequiredTokens)).toFixed() >
      Number(spendAllowance)
    )
      return setNeedAllowance(true);

    try {
      const tx = await finishTrade(
        context.ethersProvider,
        CONTRACT_ADDRESSES[context.chainId],
        Number(_tradeId)
      );
      if (tx) {
        triggerToast('transaction started..');
        setTxHash(tx.hash);
        const { status } = await tx.wait();
        if (status === 1) {
          triggerToast('trade successfull.');
          setTxHash('');
          pollSubgraph(_tradeId, 'Completed');
        }
      }
    } catch (err) {
      console.log(err);
      triggerToast('transaction cancelled..');
    }
  };

  const getTokenMeta = async () => {
    const balance = await getTokenBalance(
      context.ethersProvider,
      context.signerAddress,
      trade.requiredTokenAddress
    );
    const _requiredTokenTicker = await getTokenTicker(
      context.ethersProvider,
      trade.requiredTokenAddress
    );
    const _offeredTokenTicker = await getTokenTicker(
      context.ethersProvider,
      trade.offeredTokenAddress
    );
    const allowance = await getAllowance(
      context.ethersProvider,
      trade.requiredTokenAddress,
      context.signerAddress,
      CONTRACT_ADDRESSES[context.chainId]
    );

    setWalletBalance(Number(utils.formatEther(balance)).toFixed(0));
    setSpendAllowance(Number(utils.formatEther(allowance)).toFixed(0));
    setRequiredTokenTicker(_requiredTokenTicker);
    setOfferedTokenTicker(_offeredTokenTicker);
    setNeedAllowance(false);
  };

  useEffect(() => {
    if (context.signerAddress) {
      fetchTrade();
    }
  }, [context.signerAddress]);

  useEffect(() => {
    if (trade) getTokenMeta();
  }, [trade]);

  return (
    <Flex
      direction='column'
      w='40%'
      alignItems='center'
      justifyContent='center'
      py='2rem'
      my='auto'
    >
      {!context.signerAddress && (
        <Text fontFamily='figTree' mt='50px'>
          Connect wallet to view trade.
        </Text>
      )}

      {context.signerAddress && !fetching && !trade && (
        <Text fontFamily='figTree' mt='50px'>
          Connect address is not a participant of this trade.
        </Text>
      )}

      {fetching && <Spinner color='black' size='lg' />}

      {!fetching && trade && (
        <Flex
          w='100%'
          direction='column'
          alignItems='flex-start'
          bg='white'
          boxShadow='rgb(0 0 0 / 1%) 0px 0px 1px, rgb(0 0 0 / 4%) 0px 4px 8px, rgb(0 0 0 / 4%) 0px 16px 24px, rgb(0 0 0 / 1%) 0px 24px 32px'
          borderRadius='1rem'
          p='20px'
        >
          <HStack
            w='100%'
            alignItems='flex-start'
            justifyContent='space-between'
          >
            <Text fontFamily='openSans' fontSize='.8rem'>
              Trade ID
            </Text>
            <Text fontFamily='figTree' fontWeight='bold' color='black'>
              #{trade.tradeId}
            </Text>
          </HStack>
          <br />
          <HStack
            w='100%'
            alignItems='flex-start'
            justifyContent='space-between'
          >
            <Text fontFamily='openSans' fontSize='.8rem'>
              Trade With
            </Text>
            <HStack>
              <Text fontFamily='figTree' fontWeight='bold' color='black'>
                {Number(utils.formatEther(trade.numberOfTokensOffered)).toFixed(
                  0
                )}
              </Text>
              <ChakraLink
                fontFamily='figTree'
                color='black'
                bg='#EEF1FF'
                px='2'
                py='1px'
                borderRadius='5px'
                fontSize='.8rem'
                fontStyle='italic'
                href={`https://goerli.etherscan.io/token/${trade.offeredTokenAddress}`}
                isExternal
              >
                {offeredTokenTicker ||
                  getAccountString(trade.offeredTokenAddress)}
              </ChakraLink>
            </HStack>
          </HStack>
          <HStack
            w='100%'
            alignItems='flex-start'
            justifyContent='space-between'
          >
            <Text fontFamily='openSans' fontSize='.8rem'>
              Trade For
            </Text>
            <HStack>
              <Text fontFamily='figTree' fontWeight='bold' color='black'>
                {Number(
                  utils.formatEther(trade.numberOfRequiredTokens)
                ).toFixed(0)}
              </Text>
              <ChakraLink
                fontFamily='figTree'
                color='black'
                bg='#EEF1FF'
                px='2'
                py='1px'
                borderRadius='5px'
                fontSize='.8rem'
                fontStyle='italic'
                href={`https://goerli.etherscan.io/token/${trade.requiredTokenAddress}`}
                isExternal
              >
                {requiredTokenTicker ||
                  getAccountString(trade.requiredTokenAddress)}
              </ChakraLink>
            </HStack>
          </HStack>
          <br />
          <HStack
            w='100%'
            alignItems='flex-start'
            justifyContent='space-between'
          >
            <Text fontFamily='openSans' fontSize='.8rem'>
              Receiver address
            </Text>
            <ChakraLink
              fontFamily='figTree'
              color='black'
              bg='#EEF1FF'
              px='2'
              py='1px'
              borderRadius='5px'
              fontSize='.8rem'
              fontStyle='italic'
              href={`https://goerli.etherscan.io/address/${trade.receiverAddress}`}
              isExternal
            >
              {getAccountString(trade.receiverAddress)}
            </ChakraLink>
          </HStack>
          <br />
          <HStack
            w='100%'
            alignItems='flex-start'
            justifyContent='space-between'
          >
            <Text fontFamily='openSans' fontSize='.8rem'>
              Created at
            </Text>
            <Text fontFamily='figTree' fontWeight='bold'>
              {new Date(trade.offeredTimestamp * 1000).toLocaleDateString()}
            </Text>
          </HStack>
          <HStack
            w='100%'
            alignItems='flex-start'
            justifyContent='space-between'
          >
            <Text fontFamily='openSans' fontSize='.8rem'>
              Trade Status
            </Text>
            <Text fontFamily='figTree' fontWeight='bold'>
              {trade.tradeStatus === 'Completed'
                ? 'Complete'
                : trade.tradeStatus === 'Withdrawn'
                ? 'Withdrawn'
                : new Date() > new Date(trade.expiryTimestamp * 1000)
                ? 'Expired'
                : 'Waiting for receiver'}
            </Text>
          </HStack>

          <br />
          {new Date() > new Date(trade.expiryTimestamp * 1000) &&
          trade.tradeStatus !== 'Withdrawn' ? (
            <Flex
              w='100%'
              direction='row'
              alignItems='center'
              justifyContent='space-between'
              mt='1rem'
            >
              <Text
                fontFamily='figTree'
                fontWeight='bold'
                fontSize='.8rem'
                color='#AEBDCA'
                fontStyle='italic'
              >
                Stake can be claimed back.
              </Text>
              {context.signerAddress.toLowerCase() ===
                trade.offerProviderAddress && (
                <Button
                  bg='black'
                  color='white'
                  fontSize='.8rem'
                  ml='auto'
                  _hover={{
                    opacity: 0.8
                  }}
                  isLoading={loading}
                  onClick={() => withdrawStake(trade.tradeId)}
                >
                  Claim Stake
                </Button>
              )}
            </Flex>
          ) : (
            context.signerAddress.toLowerCase() === trade.receiverAddress && (
              <>
                {!needAllowance && trade.tradeStatus !== 'Completed' && (
                  <Button
                    bg='black'
                    color='white'
                    fontSize='.8rem'
                    ml='auto'
                    _hover={{
                      opacity: 0.8
                    }}
                    isLoading={loading}
                    onClick={async () => {
                      setLoading(true);
                      await executeTrade(trade.tradeId);
                      setLoading(false);
                    }}
                  >
                    Execute trade
                  </Button>
                )}
                {needAllowance && trade.tradeStatus !== 'Completed' && (
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
                    {`Approve ${requiredTokenTicker}`}
                  </Button>
                )}
              </>
            )
          )}
          <br />
          <Tag
            ml='auto'
            fontFamily='figTree'
          >{`Your balance: ${walletBalance} ${requiredTokenTicker}`}</Tag>

          <ChakraLink
            href={`https://goerli.etherscan.io/tx/${txHash}`}
            isExternal
            ml='auto'
            textDecoration='underline'
            fontFamily='openSans'
            px='2'
            py='1'
            fontSize='.8rem'
            visibility={txHash ? 'visible' : 'hidden'}
          >
            View transaction..
          </ChakraLink>
        </Flex>
      )}
    </Flex>
  );
};

export default Trade;
