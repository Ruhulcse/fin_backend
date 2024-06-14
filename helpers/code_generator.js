module.exports.generateCode = async (model, prefix, length = 4) => {
  const collectionName = require(`../models/${model}`);
  const getPreviousCode = await collectionName
    .findOne({}, { _id: 0, code: 1 })
    .sort({ $natural: -1 });

  const previousCode = !getPreviousCode ? "AC-0000" : getPreviousCode.code;
  preCode = previousCode.split("-")[1];
  count = "" + (parseInt(preCode) + 1);

  let number = "";
  for (let i = 0; i < length - count.length; i++) {
    number += "0";
  }
  return prefix + "-" + number + count;
};
