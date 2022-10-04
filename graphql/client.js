import { ApolloClient, InMemoryCache } from '@apollo/client';

const defaultOptions = {
  watchQuery: {
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore'
  },
  query: {
    fetchPolicy: 'network-only',
    errorPolicy: 'all'
  }
};

export const SUBGRAPH_CLIENT = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/manolingam/escrow-trade',
  cache: new InMemoryCache(),
  defaultOptions: defaultOptions
});
