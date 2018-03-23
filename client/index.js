import Vue from "vue";
import Nes from "nes";
import moment from "moment";
import { store, app } from './app'
const client = new Nes.Client("ws://localhost:3000");

const start = async () => {
  await store.dispatch("setWeb3");
  await store.dispatch("setNetwork");
  await store.dispatch("setContracts");
  await store.dispatch("setDecimals");
  await store.dispatch("setSupply");
  await setDefaultAccount();
  await store.dispatch("setAllowance");
  await store.dispatch("setBalance");
  await store.dispatch("addDate", moment())
  await store.dispatch("addDate", moment().subtract(1, "days"))
  poll();
  setInterval(poll, 2000);
  await client.connect();
  client.onUpdate = (data) => {
    console.log(data);
    store.dispatch("addPost", data);
  };
  app.$mount('#app');
};

window.store = store;

start();

function setDefaultAccount(){
  return web3.eth.getAccounts()
    .then(accounts=>store.dispatch("setAccount", accounts[0]));
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
