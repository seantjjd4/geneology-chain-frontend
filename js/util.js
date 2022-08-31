const handleChainChange = async () => {
    if (await ethereum.request({ method: 'eth_chainId'}) != '0x3') {
        try {
            await ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x3' }],
            });
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
              try {
                await ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [
                    {
                      chainId: '0xf00',
                      chainName: '...',
                      rpcUrls: ['https://...'] /* ... */,
                    },
                  ],
                });
              } catch (addError) {
                // handle "add" error
              }
            }
            // handle other "switch" errors
        }
    }
}

const checkConnect = async () => {
    return (await checkWalletConnect() && await checkChainConnect());
}

const checkWalletConnect = async () => {
    let a;
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    if (accounts.length != 0) {
        a = true;
    } else {
        a = false;
    }
    return a;
}

const checkChainConnect = async () => {
    if (await ethereum.request({ method: 'eth_chainId'}) == '0x3') {
        return true;
    } else {
        handleChainChange();
        return false;
    }
}

export { handleChainChange, checkWalletConnect, checkConnect };