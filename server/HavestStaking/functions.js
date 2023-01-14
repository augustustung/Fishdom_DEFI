require('dotenv').config()
const HavestStakingModel = require("../models/havestStakingModel")

async function handleGetList(filter, skip, limit, order) {
  return new Promise(async (resolve, reject) => {
    try {
      let commonFilter = {
        ...filter
      };
      let data = await HavestStakingModel.
        find(commonFilter).
        limit(limit).
        skip(skip).
        sort(order);
      if (data && data.length > 0) {
        let count = await HavestStakingModel.count(commonFilter);
        resolve({ data: data, count: count });
      } else {
        resolve({ data: [], count: 0 });
      }
    } catch (error) {
      console.error(__filename, error);
      reject('failed');
    }
  })
}

module.exports = {
  handleGetList
}