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
async function decodeTxData(provider, txHash, abiEvent) {
  return new Promise(async (resolve) => {
    try {
      // get tx unconfirm
      let txUncofirmed = await provider.getTransaction(txHash).catch(() => undefined);
      if (!txUncofirmed) {
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

      let logsData = txConfirmed.logs;
      let iface = new ethers.utils.Interface(abiEvent);
      let log = iface.parseLog(logsData[logsData.length - 1]);

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