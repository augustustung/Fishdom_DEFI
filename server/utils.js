const { ethers } = require('ethers');

async function decodeTxData(provider, txHash, topicFields, inputFields = []) {
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
      let dataDecoded = ethers.utils.defaultAbiCoder.decode(topicFields, logsData[logsData.length - 1].data)
      let inputData = []
      if (inputFields && inputFields.length > 0) {
        inputData = ethers.utils.defaultAbiCoder.decode(
          inputFields,
          ethers.utils.hexDataSlice(txUncofirmed.data, 4)
        )
      }
      resolve({
        dataDecoded,
        txUncofirmed,
        txConfirmed,
        inputData
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