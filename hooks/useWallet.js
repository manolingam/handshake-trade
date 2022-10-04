import { useContext, useState } from 'react';
import { providers } from 'ethers';
import Web3 from 'web3';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';

import { AppContext } from '../context/AppContext';

import { SIGNATURE_MESSAGE } from '../utils/constants';
import { rpcUrls } from '../config';

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      rpc: {
        5: rpcUrls[5]
      }
    }
  }
};

export const useWallet = () => {
  const context = useContext(AppContext);
  const [signaturePending, setSignaturePending] = useState(false);

  const setWeb3Provider = async (modalProvider) => {
    const ethersProvider = new providers.Web3Provider(modalProvider);
    const web3 = new Web3(modalProvider);
    const signerAddress = (
      await ethersProvider.getSigner().getAddress()
    ).toLowerCase();
    const chainId = Number(modalProvider.chainId);

    await ethersProvider.getSigner().signMessage(SIGNATURE_MESSAGE);

    context.setWeb3Data({
      ethersProvider,
      web3,
      signerAddress,
      chainId
    });
  };

  let web3Modal;

  const connectWallet = async () => {
    try {
      setSignaturePending(true);

      web3Modal = new Web3Modal({
        network: 'mainnet',
        cacheProvider: true,
        providerOptions
      });

      web3Modal.clearCachedProvider();
      const modalProvider = await web3Modal.connect();

      await setWeb3Provider(modalProvider);
      setSignaturePending(false);

      modalProvider.on('accountsChanged', async () => {
        window.location.reload();
      });

      modalProvider.on('chainChanged', (_chainId) => {
        const chainId = Number(_chainId);
        const ethersProvider = new providers.Web3Provider(modalProvider);
        context.setWeb3Data({
          chainId,
          ethersProvider
        });
      });
    } catch (err) {
      setSignaturePending(false);
      console.log(err);
    }
  };

  const disconnect = async () => {
    context.setWeb3Data({
      ethersProvider: null,
      web3: null,
      signerAddress: null,
      signerEns: null,
      chainId: null
    });
  };

  return { signaturePending, connectWallet, disconnect };
};
