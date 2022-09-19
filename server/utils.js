const { ethers } = require('ethers');

async function decodeTxData(provider, txHash, fields) {
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

      let dataDecoded = ethers.utils.defaultAbiCoder.decode(fields, txConfirmed.logs[0].data)
      resolve({
        dataDecoded,
        txUncofirmed,
        txConfirmed
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