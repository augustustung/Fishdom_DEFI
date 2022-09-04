'use strict';
const { ethers } = require('ethers');
require('dotenv').config();
const FishdomTokenAbi = require('../const/fishdomTokenAbi');


function _parseBigNumberToNumber(value, decimals) {
  if (!value) return 0;
  let formatWei = value.toString();
  let length = formatWei.length;
  let fixedValue = '';
  let stack = 0;
  for (let i = length - 1; i >= 0; i--) {
    stack++;
    if (formatWei[i] !== '0') {
      fixedValue = `${formatWei[i]}${fixedValue}` // nếu kí tự != 0 thì lưu lại 
    }
    formatWei = formatWei.slice(0, -1); // xoá ký tự cuối
    if (stack === decimals) {
      break;
    }
  }
  formatWei = `${formatWei}${fixedValue ? "." + fixedValue : ""}`;
  return parseFloat(formatWei);
}

async function _getDecimalEther(signer, abi) {
  return new Promise(async (resolve) => {
    try {
      const contractInstance = new ethers.Contract(process.env.FISHDOM_TOKEN, abi, signer)
      let decimal = await contractInstance.decimals();
      if (decimal) {
        decimal = parseInt(decimal.toString());
        resolve(decimal);
      } else {
        resolve(undefined);
      }
    } catch (error) {
      console.error("get decimal error");
      resolve(undefined);
    }
  })
}

function _handleGetReceiver(signature) {
  let receiver = signature.replace(/^0x/g, '');
  while (receiver[0] === '0') {
    receiver = receiver.slice(1);
  }
  return '0x' + receiver;
}

async function _decodeAndGetBalance(provider, txHash) {
  return new Promise(async (resolve) => {
    try {
      // get tx unconfirm
      let txUncofirmed = await provider.getTransaction(txHash).catch(() => undefined);
      if (!txUncofirmed) {
        resolve(undefined);
        return;
      }
      /* check if 
       * - data contains "0xa9059cbb" (signature of function transfer) 
       * - chainId is correct
       * - "to" === usdt address
      */
      if (!(
        txUncofirmed.data.includes('0xa9059cbb') &&
        txUncofirmed.to === process.env.FISHDOM_TOKEN &&
        txUncofirmed.from === userData.walletAddress
      )) {
        resolve(undefined);
        return;
      }
      // check if tx confirmed
      let txConfirmed = await txUncofirmed.wait(1).catch(() => undefined);
      if (!txConfirmed) {
        console.info("tx hasn't confirmed yet");
        resolve(undefined);
        return;
      }

      let receiver = _handleGetReceiver(txConfirmed.logs[0].topics[2]);
      // check if receiver === merchant address 
      if (receiver === process.env.BSC_WALLET_ADDRESS) {
        let amount = ethers.utils.defaultAbiCoder.decode(['uint256'], txConfirmed.logs[0].data)
        amount = amount[0].toString();
        resolve(amount);
      } else {
        resolve(undefined);
      }
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
      const signer = new ethers.Wallet(
        process.env.BSC_WALLET_PK,
        provider
      );
      let balanceOfTx = await _decodeAndGetBalance(provider, txHash, userData);
      const decimal = await _getDecimalEther(signer, FishdomTokenAbi);
      balanceOfTx = _parseBigNumberToNumber(balanceOfTx, decimal);
      resolve(balanceOfTx);
    } catch (error) {
      console.error(__filename, error);
      reject(undefined);
    }
  })
}


async function handleWithraw(walletAddress, amount) {
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_ENDPOINT)
  const signer = new ethers.Wallet(
    process.env.BSC_WALLET_PK,
    provider
  );
  const contractInstance = new ethers.Contract(process.env.FISHDOM_TOKEN, FishdomTokenAbi, signer);
  let parseAmount = ethers.utils.parseEther((amount * 0.9).toString())
  let tx = await contractInstance.transfer(walletAddress, parseAmount)
  tx.wait(1)
    .then(() => {
      return tx;
    })
    .catch(() => {
      return undefined;
    });
}

module.exports = {
  handleDepositToken,
  handleWithraw
}