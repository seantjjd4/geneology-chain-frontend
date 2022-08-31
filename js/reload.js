import { web3Init, updateWeb3Account } from "./contract.js"
import { handleChainChange, checkWalletConnect } from "./util.js";

const reload = async () => {
    try {
        await handleChainChange();
        if (await checkWalletConnect()) {
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            web3Init();
            updateWeb3Account(accounts[0]);
        }
        ethereum.on('chainChanged', async (_chainId) => {
            handleChainChange();
        });

        ethereum.on("accountsChanged", function (accounts) {
            console.log("accountsChanged", accounts);
            window.location.reload();
        });
    } catch (error) {
        alert(error);
    }
}

export default reload;