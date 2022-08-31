import { web3Init, updateWeb3Account } from "./contract.js";
import { handleChainChange } from "./util.js";

const connectWallet = async () => {
    console.log("ethereum", window.ethereum);

    if (typeof window.ethereum !== "undefined") {
        try {
            if (await ethereum.request({ method: 'eth_chainId'}) != '0x3') {
                await handleChainChange();
            }

            var accounts = await ethereum.request({
                method: "eth_requestAccounts",
            });
            console.log("accounts", accounts);

            web3Init();

            updateWeb3Account(accounts[0]);

            //MetaMask切換網路
            ethereum.on('chainChanged', async(_chainId) => {
                await handleChainChange();
            });
            //MetaMask切換帳戶
            ethereum.on("accountsChanged", function (accounts) {
                console.log("accountsChanged", accounts);
                window.location.reload();
            });

        } catch (error) {
            alert(error.message);
        }
    } else {
        alert("未安裝 MetaMask!");
    }
}

export default connectWallet;