import { Contract, utils } from 'ethers';

export const approveSpender = async (
  ethersProvider,
  contractAddress,
  addressTo,
  amount
) => {
  const abiInterface = new utils.Interface([
    'function approve(address spender, uint256 amount) public virtual override returns (bool)'
  ]);
  const contract = new Contract(
    contractAddress,
    abiInterface,
    ethersProvider.getSigner()
  );
  return contract.approve(addressTo, amount);
};

export const getTokenBalance = async (
  ethersProvider,
  userAddress,
  tokenContractAddress
) => {
  const abiInterface = new utils.Interface([
    'function balanceOf(address owner) public view virtual override returns (uint256)'
  ]);
  const contract = new Contract(
    tokenContractAddress,
    abiInterface,
    ethersProvider
  );
  return contract.balanceOf(userAddress);
};

export const getTokenTicker = async (ethersProvider, tokenContractAddress) => {
  const abiInterface = new utils.Interface([
    'function symbol() public view virtual override returns (string)'
  ]);
  const contract = new Contract(
    tokenContractAddress,
    abiInterface,
    ethersProvider
  );
  return contract.symbol();
};

export const getAllowance = async (
  ethersProvider,
  tokenContractAddress,
  ownerAddress,
  spenderAddress
) => {
  const abiInterface = new utils.Interface([
    'function allowance(address owner, address spender) public view virtual override returns (uint256)'
  ]);
  const contract = new Contract(
    tokenContractAddress,
    abiInterface,
    ethersProvider
  );
  return contract.allowance(ownerAddress, spenderAddress);
};

export const createTrade = async (
  ethersProvider,
  contractAddress,
  offeredTokenAddress,
  numberOfTokensOffered,
  receiverAddress,
  requiredTokenAddress,
  numberOfRequiredTokens,
  tradeDuration
) => {
  const abiInterface = new utils.Interface([
    'function createOpenTradeOffer(address _offeredTokenAddress, uint _numberOfTokensOffered, address _receiverAddress, address _requiredTokenAddress, uint _numberOfRequiredTokens, uint _tradeOpenDuration) public'
  ]);
  const contract = new Contract(
    contractAddress,
    abiInterface,
    ethersProvider.getSigner()
  );
  return contract.createOpenTradeOffer(
    offeredTokenAddress,
    numberOfTokensOffered,
    receiverAddress,
    requiredTokenAddress,
    numberOfRequiredTokens,
    tradeDuration
  );
};

export const claimStakeBack = async (
  ethersProvider,
  contractAddress,
  tradeId
) => {
  const abiInterface = new utils.Interface([
    'function withdrawFromInCompleteTrade(uint _tradeId) public'
  ]);
  const contract = new Contract(
    contractAddress,
    abiInterface,
    ethersProvider.getSigner()
  );
  return contract.withdrawFromInCompleteTrade(tradeId);
};

export const finishTrade = async (ethersProvider, contractAddress, tradeId) => {
  const abiInterface = new utils.Interface([
    'function finishOpenTrade(uint _tradeId) public'
  ]);
  const contract = new Contract(
    contractAddress,
    abiInterface,
    ethersProvider.getSigner()
  );
  return contract.finishOpenTrade(tradeId);
};
