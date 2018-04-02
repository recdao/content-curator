const Promise = require("bluebird");
const initWeb3 = require("./initWeb3");
let web3 = initWeb3.reset();
const processFlip = require("./processFlip");
const ContentDAO = initWeb3.contracts.ContentDAO;

let lastBlock;
try { lastBlock = require("./.lastBlock") } catch(err) {}

// lastBlock = 2000000
if(lastBlock) catchUp(lastBlock - 1);

async function catchUp(fromBlock){
  console.log(`process Tip events from block: ${fromBlock}`);
  let tips = await ContentDAO.getPastEvents("Flip", {fromBlock});
  await Promise.each(tips, processFlip);
}
