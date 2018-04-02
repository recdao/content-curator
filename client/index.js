import Vue from "vue";
import Nes from "nes";
import moment from "moment";
import { NETWORKS } from 'constants.json';
import { store, app } from './app'
const client = new Nes.Client(`ws://${location.hostname}:${location.port}`);

const start = async () => {
  app.$mount('#app');
  let hasWeb3 = await store.dispatch("setWeb3");
  if(!hasWeb3) return;
  let network = await store.dispatch("setNetwork");
  if(![NETWORKS.RINKEBY, NETWORKS.OTHER].includes(network)) return;
  store.dispatch("setContracts");
  let watching = {};
  try {
    let stored = JSON.parse(localStorage.getItem("watching"));
    if(stored) watching = stored;
  } catch(e){console.log("could not retrieve existing watch items.", e)}
  await store.commit("SET_WATCHING", watching);
  await store.dispatch("setDecimals");
  await store.dispatch("setSupply");
  let defaultAccount = await setDefaultAccount();
  if(defaultAccount){
    await store.dispatch("setAllowance");
    await store.dispatch("setBalance");
    await store.dispatch("setIsMember");
  }
  await store.dispatch("addDate", moment())
  await store.dispatch("addDate", moment().subtract(1, "days"))
  poll();
  setInterval(poll, 2000);
  await client.connect();
  client.onUpdate = (data) => store.dispatch("addPost", data);
};

window.store = store;

start();

async function setDefaultAccount(){
  return web3.eth.getAccounts()
    .then(accounts=>{
      store.dispatch("setAccount", accounts[0])
      return accounts[0];
    });
}

function poll(){
  let current = store.state.blockNum;
  web3.eth.getBlockNumber()
    .then(num=>{
      if(num !== current) onNewBlock();
      store.commit("SET_BLOCK_NUM", num);
    });
}

function onNewBlock(){
  let posts = store.state.posts;
  for (let id in posts) {
    store.dispatch("syncPost", posts[id]);
  }
}
