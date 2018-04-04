const Promise = require("bluebird");
const processFlip = require("./processFlip");
const writeFileAsync = Promise.promisify(require("fs").writeFile);
const providerUrl = require('../config').providerUrl;
const Web3 = require("web3");
const ContentDAOArtifacts = require("../contracts/build/contracts/ContentDAO.json");
const address = ContentDAOArtifacts.networks["4"].address;
console.log("ContentDAO address:", address);

exports.contracts = {ContentDAO: null};
exports.reset = function(){
  // new Web3("http://127.0.0.1:9545/");
  let web3 = new Web3(providerUrl);
  this.contracts.ContentDAO = new web3.eth.Contract(ContentDAOArtifacts.abi, address);
  subscribeFlips(this.contracts.ContentDAO);
  subscribeOpens(this.contracts.ContentDAO);
  subscribeBlocks(web3);
  return global.web3 = web3;
}

function subscribeFlips(ContentDAO){
  ContentDAO.events.Flip()
    .on("data", processFlip)
    .on("error", console.warn);
}

function subscribeOpens(ContentDAO){
  ContentDAO.events.Open()
    .on("data", processFlip)
    .on("error", console.warn);
}

function subscribeBlocks(web3){
  web3.eth.subscribe("newBlockHeaders")
    .on("data", async function(block){
      // console.log(block.number);
      await writeFileAsync(`${__dirname}/.lastBlock.json`, JSON.stringify(block.number));
    });
}
