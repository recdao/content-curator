import Vue from "vue";
import Nes from "nes";
import moment from "moment";
import { store, app } from './app'
const dateFormat = "YYYY-MM-DD";
const client = new Nes.Client("ws://localhost:3000");

const start = async () => {
  await store.dispatch("setWeb3");
  await store.dispatch("setNetwork");
  await setDefaultAccount();
  await store.dispatch("setContracts");
  await store.dispatch("setDecimals");
  await store.dispatch("setBalance");
  await store.dispatch("setSupply");
  await store.dispatch("addArchive", moment().format(dateFormat))
  await store.dispatch("addArchive", moment().subtract(1, "days").format(dateFormat))
  poll();
  setInterval(poll, 2000);
  await client.connect();
  client.onUpdate = (data) => {
    console.log(data);
    store.commit("ADD_POST", data);
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
  web3.eth.getBlockNumber()
    .then(num=>store.commit("SET_BLOCK_NUM", num));
}
