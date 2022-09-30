'use strict';
const { ethers } = require('ethers');
require('dotenv').config();
const FishdomToken = require('../contracts/token/FishdomToken.sol/FishdomToken.json');
const UtilFunctions = require('../utils');

function _handleGetReceiver(signature) {
  let receiver = signature.replace(/^0x/g, '');
  while (receiver[0] === '0') {
    receiver = receiver.slice(1);
  }
  return '0x' + receiver;
}

async function _decodeAndGetBalance(provider, txHash, userData) {
  return new Promise(async (resolve) => {
    try {
      let {
        eventData,
        txUncofirmed,
        txConfirmed
      } = await UtilFunctions.decodeTxData(provider, txHash, [`
        event Transfer(address indexed from, address indexed to, uint256 value)
      `]);
      const amount = eventData.args.value
      /* check if 
        * - data contains "0xa9059cbb" (signature of function transfer) 
        * - chainId is correct
        * - "to" === usdt address
      */
      if (!(
        txUncofirmed.data.includes('0xa9059cbb') &&
        txUncofirmed.to === FishdomToken.networks[97].address &&
        txUncofirmed.from === userData.walletAddress
      )) {
        resolve(undefined);
        return;
      }
      let receiver = _handleGetReceiver(txConfirmed.logs[0].topics[2]);
      // check if receiver === merchant address
      if (receiver === process.env.BSC_WALLET_ADDRESS.toLowerCase()) {
        resolve(amount);
      } else {
        resolve(undefined);
      }
      resolve(undefined)
    } catch (error) {
      console.error("error get tx: " + txHash);
      console.error(error);
      resolve(undefined);
    }
  })
}

async function handleDepositToken(txHash, userData) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_ENDPOINT)
      let balanceOfTx = await _decodeAndGetBalance(provider, txHash, userData);
      if (balanceOfTx) {
        balanceOfTx = ethers.utils.formatEther(balanceOfTx);
        resolve(balanceOfTx);
      } else {
        reject('failed');
      }
    } catch (error) {
      console.error(__filename, error);
      reject('failed');
    }
  })
}


async function handleWithraw(walletAddress, amount) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_ENDPOINT)
    const signer = new ethers.Wallet(
      process.env.BSC_WALLET_PK,
      provider
    );
    const contractInstance = new ethers.Contract(FishdomToken.networks[97].address, FishdomToken.abi, signer);
    let parseAmount = ethers.utils.parseEther((amount * 0.9).toString())
    let tx = await contractInstance.transfer(
      walletAddress,
      parseAmount
    )
    return tx.wait(1)
      .then(() => {
        return tx;
      })
      .catch((err) => {
        console.error("transfer Fdt error", err)
        return undefined;
      });
  } catch (error) {
    console.error(__filename, error);
    return undefined;
  }
}

module.exports = {
  handleDepositToken,
  handleWithraw
}