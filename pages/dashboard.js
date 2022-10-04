/* eslint-disable react-hooks/exhaustive-deps */
import {
  Flex,
  Box,
  Text,
  Button,
  SimpleGrid,
  Tab,
  Tabs,
  TabList,
  Spinner,
  HStack,
  Link as ChakraLink
} from '@chakra-ui/react';
import { useState, useEffect, useContext } from 'react';
import { utils } from 'ethers';
import Link from 'next/link';

import { AppContext } from '../context/AppContext';
import { SUBGRAPH_CLIENT } from '../graphql/client';
import {
  CREATED_TRADES_QUERY,
  COMPLETED_TRADES_QUERY,
  WITHDRAWN_TRADES_QUERY
} from '../graphql/queries';

const RECORDS_PER_PAGE = 10;

const getAccountString = (account) => {
  const len = account.length;
  return `0x${account.substr(2, 8).toUpperCase()}...${account
    .substr(len - 3, len - 1)
    .toUpperCase()}`;
};

const Dashboard = () => {
  const context = useContext(AppContext);

  const [allRecords, setAllRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentRecords, setCurrentRecords] = useState([]);
  const [totalPages, setTotalPages] = useState(0);

  const tabsAndType = ['Created', 'Completed', 'Withdrawn'];

  const [tabIndex, setTabIndex] = useState(0);
  const [filterType, setFilterType] = useState(tabsAndType[tabIndex]);
  const [fetching, setFetching] = useState(false);

  const paginate = (_records, _pageNumber) => {
    _pageNumber ? setCurrentPage(_pageNumber) : null;
    const indexOfLastRecord = currentPage * RECORDS_PER_PAGE;
    const indexOfFirstRecord = indexOfLastRecord - RECORDS_PER_PAGE;
    const currentRecords = _records.slice(
      indexOfFirstRecord,
      indexOfLastRecord
    );

    setCurrentRecords(currentRecords);
  };

  const cropRecords = (_trades, _page) => {
    setTotalPages(Math.ceil(_trades.length / RECORDS_PER_PAGE));
    paginate(_trades, _page);
  };

  const fetchTrades = async () => {
    setFetching(true);
    const {
      data: { trades }
    } = await SUBGRAPH_CLIENT.query({
      query:
        filterType === 'Created'
          ? CREATED_TRADES_QUERY
          : filterType === 'Completed'
          ? COMPLETED_TRADES_QUERY
          : WITHDRAWN_TRADES_QUERY,
      variables: { eth_address: `${context.signerAddress}` }
    });
    setAllRecords(trades);
    cropRecords(trades, 1);
    setFetching(false);
  };

  useEffect(() => {
    if (context.signerAddress) fetchTrades();
  }, [filterType]);

  useEffect(() => {
    cropRecords(allRecords);
  }, [currentPage]);

  useEffect(() => {
    if (context.signerAddress) fetchTrades();
  }, [context.signerAddress]);

  return (
    <Flex
      direction='column'
      w='80%'
      minH='500px'
      alignItems='center'
      justifyContent='flex-start'
      py='2rem'
      my='auto'
    >
      {fetching && <Spinner color='black' size='lg' my='auto' />}

      {!fetching &&
        (context.signerAddress ? (
          <>
            <Flex
              w='100%'
              direction='row'
              alignItems='center'
              justifyContent='space-between'
            >
              <HStack>
                <Text
                  maxW='350px'
                  color='black'
                  p='5px'
                  fontFamily='figTree'
                  mr='auto'
                  fontSize='1.2rem'
                >
                  Your trades
                </Text>
                <Button
                  bg='black'
                  color='white'
                  mx='auto'
                  mt='20px'
                  fontSize='.8rem'
                  onClick={fetchTrades}
                  _hover={{
                    opacity: 0.8
                  }}
                >
                  Refresh
                </Button>
              </HStack>
              <Tabs
                fontFamily='openSans'
                color='black'
                align='end'
                isLazy
                defaultIndex={tabIndex}
                variant='unstyled'
                outline='none'
                onChange={(index) => {
                  setTabIndex(index);
                  setFilterType(tabsAndType[index]);
                }}
              >
                <TabList>
                  <Tab
                    _selected={{
                      color: 'white',
                      bg: 'black'
                    }}
                    _focus={{
                      outline: '0 !important'
                    }}
                  >
                    <Text ml='5px'>Created</Text>
                  </Tab>
                  <Tab
                    _selected={{
                      color: 'white',
                      bg: 'black'
                    }}
                    _focus={{
                      outline: '0 !important'
                    }}
                  >
                    <Text ml='5px'>Completed</Text>
                  </Tab>
                  <Tab
                    _selected={{
                      color: 'white',
                      bg: 'black'
                    }}
                    _focus={{
                      outline: '0 !important'
                    }}
                  >
                    <Text ml='5px'>Withdrawn</Text>
                  </Tab>
                </TabList>
              </Tabs>
            </Flex>

            {currentRecords.length > 0 && (
              <SimpleGrid columns='2' w='100%' my='25px' gap={3}>
                {currentRecords.map((record, index) => {
                  return (
                    <Flex
                      w='100%'
                      key={index}
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
                        <Text
                          fontFamily='figTree'
                          fontWeight='bold'
                          color='black'
                        >
                          #{record.tradeId}
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
                          <Text
                            fontFamily='figTree'
                            fontWeight='bold'
                            color='black'
                          >
                            {Number(
                              utils.formatEther(record.numberOfTokensOffered)
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
                            href={`https://goerli.etherscan.io/token/${record.offeredTokenAddress}`}
                            isExternal
                          >
                            {getAccountString(record.offeredTokenAddress)}
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
                          <Text
                            fontFamily='figTree'
                            fontWeight='bold'
                            color='black'
                          >
                            {Number(
                              utils.formatEther(record.numberOfRequiredTokens)
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
                            href={`https://goerli.etherscan.io/token/${record.requiredTokenAddress}`}
                            isExternal
                          >
                            {getAccountString(record.requiredTokenAddress)}
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
                          href={`https://goerli.etherscan.io/address/${record.receiverAddress}`}
                          isExternal
                        >
                          {getAccountString(record.receiverAddress)}
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
                          {new Date(
                            record.offeredTimestamp * 1000
                          ).toLocaleDateString()}
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
                          {record.tradeStatus === 'Completed'
                            ? 'Complete'
                            : record.tradeStatus === 'Withdrawn'
                            ? 'Withdrawn'
                            : new Date() >
                              new Date(record.expiryTimestamp * 1000)
                            ? 'Expired'
                            : 'Waiting for receiver'}
                        </Text>
                      </HStack>
                      <br />

                      <Link href={`/trade/${record.tradeId}`} passhref>
                        <Button
                          bg='black'
                          color='white'
                          ml='auto'
                          fontSize='.8rem'
                          _hover={{
                            opacity: 0.8
                          }}
                        >
                          View Trade
                        </Button>
                      </Link>
                    </Flex>
                  );
                })}
              </SimpleGrid>
            )}

            {currentRecords.length == 0 && (
              <Text fontFamily='figTree' mt='50px'>
                No trades found for the selected category or try refreshing.
              </Text>
            )}

            {totalPages > 0 && (
              <Flex
                w='100%'
                direction='row'
                justifyContent='space-between'
                alignItems='center'
                mt='2rem'
              >
                <Button
                  bg='black'
                  color='white'
                  disabled={currentPage - 1 == 0}
                  onClick={() =>
                    setCurrentPage((currentPage) => currentPage - 1)
                  }
                  _hover={{
                    opacity: currentPage - 1 == 0 ? 0.5 : 0.8
                  }}
                >
                  Prev
                </Button>
                {totalPages > 0 && (
                  <Text fontFamily='figTree'>
                    Page {currentPage} of {totalPages}
                  </Text>
                )}
                <Button
                  bg='black'
                  color='white'
                  disabled={currentPage + 1 > totalPages}
                  onClick={() =>
                    setCurrentPage((currentPage) => currentPage + 1)
                  }
                  _hover={{
                    opacity: currentPage + 1 > totalPages ? 0.5 : 0.8
                  }}
                >
                  Next
                </Button>
              </Flex>
            )}
          </>
        ) : (
          <Text fontFamily='figTree' mt='50px'>
            Connect wallet to view trades.
          </Text>
        ))}
    </Flex>
  );
};

export default Dashboard;
