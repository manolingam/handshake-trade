import { gql } from '@apollo/client';

export const CREATED_TRADES_QUERY = gql`
  query CreatedTrades($eth_address: String!) {
    trades(
      where: { tradeStatus: Created, offerProviderAddress: $eth_address }
    ) {
      tradeId
      offerProviderAddress
      offeredTokenAddress
      numberOfTokensOffered
      receiverAddress
      requiredTokenAddress
      numberOfRequiredTokens
      offeredTimestamp
      expiryTimestamp
      tradeStatus
    }
  }
`;

export const COMPLETED_TRADES_QUERY = gql`
  query CompletedTrades($eth_address: String!) {
    trades(
      where: { tradeStatus: Completed, offerProviderAddress: $eth_address }
    ) {
      tradeId
      offerProviderAddress
      offeredTokenAddress
      numberOfTokensOffered
      receiverAddress
      requiredTokenAddress
      numberOfRequiredTokens
      offeredTimestamp
      expiryTimestamp
      tradeStatus
    }
  }
`;

export const WITHDRAWN_TRADES_QUERY = gql`
  query WithdrawnTrades($eth_address: String!) {
    trades(
      where: { tradeStatus: Withdrawn, offerProviderAddress: $eth_address }
    ) {
      tradeId
      offerProviderAddress
      offeredTokenAddress
      numberOfTokensOffered
      receiverAddress
      requiredTokenAddress
      numberOfRequiredTokens
      offeredTimestamp
      expiryTimestamp
      tradeStatus
    }
  }
`;

export const TRADE_WITH_ID_QUERY = gql`
  query Trade($tradeId: Int!) {
    trades(where: { tradeId: $tradeId }) {
      tradeId
      offerProviderAddress
      offeredTokenAddress
      numberOfTokensOffered
      receiverAddress
      requiredTokenAddress
      numberOfRequiredTokens
      offeredTimestamp
      expiryTimestamp
      tradeStatus
    }
  }
`;
