const { ethers } = require('ethers');

/**
 * 
 * @param {*} provider provider of chain
 * @param {*} txHash transaction hash
 * @param {*} abiEvent ex: event BuyMarketItem(
        uint256 indexed itemId,
        uint256 indexed tokenId,
        uint256 price,
        address seller,
        address buyer
      )
 * @returns { eventData, txUncofirmed, txConfirmed }
 */
async function decodeTxData(provider, txHash, abiEvent, options) {
  return new Promise(async (resolve) => {
    try {
      let txUncofirmed, txConfirmed
      if (!options) {
        // get tx unconfirm
        txUncofirmed = await provider.getTransaction(txHash).catch(() => undefined);
        if (!txUncofirmed) {
          resolve(undefined);
          return;
        }
        // check if tx confirmed
        txConfirmed = await txUncofirmed.wait(1).catch(() => undefined);
        if (!txConfirmed) {
          console.info("tx hasn't confirmed yet");
          resolve(undefined);
          return;
        }
      } else if (options.skipVerify) {
        txConfirmed = options.confirmedTx
      }
      let logsData = txConfirmed.logs;
      let iface = new ethers.utils.Interface(abiEvent);
      let log
      if (options.mintAmount) {
        for (let i = logsData.length - options.mintAmount; i <= logsData.length - 1; i++) {
          const parsedData = iface.parseLog(logsData[i])
          if (!log) {
            log = [parsedData];
          } else {
            log.push(parsedData)
          }
        }
      }

      resolve({
        eventData: log,
        txUncofirmed,
        txConfirmed,
      });
    } catch (error) {
      console.error("error get tx: " + txHash);
      console.error(error);
      resolve(undefined);
    }
  })
}

module.exports = {
  decodeTxData
}