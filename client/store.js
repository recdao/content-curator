import Vue from 'vue'
import Vuex from 'vuex'
import Web3 from 'web3';
import moment from "moment";
import bases from 'bases';
import RECDAOArtifacts from 'artifacts/RECDAO.json';
import RegistryArtifacts from 'artifacts/Registry.json';
import TokenArtifacts from 'artifacts/Token.json';
import ContentDAOArtifacts from 'artifacts/ContentDAO.json';
import { NETWORKS } from 'constants.json';
const dateFormat = "YYYY-MM-DD";
// import RegistryArtifacts from 'artifacts/Registry.json';
// import TokenArtifacts from 'artifacts/Token.json';

Vue.use(Vuex)

const state = {
  account: null,
  allowance: 0,
  balance: null,
  blockNum: null,
  contracts: {},
  count: 0,
  dates: [],
  decimals: null,
  isMember: null,
  network: null,
  posts: {},
  selectedDates: [],
  selectedSubs: [],
  subs: [],
  transactions: [],
  username: null,
  web3: null
}

const mutations = {
  INCREMENT (state, account) {
    state.count++;
  },
  ADD_DATE (state, date) {
    if(!state.dates.includes(date)) {
      state.dates.push(date);
      state.selectedDates.push(date);
    }
  },
  ADD_SUB (state, sub) {
    if(!state.subs.includes(sub)) {
      state.subs.push(sub);
      state.selectedSubs.push(sub);
    }
  },
  SET_ACCOUNT (state, account) {
    state.account = account;
  },
  SET_ALLOWANCE (state, allowance) {
    state.allowance = allowance;
  },
  SET_BLOCK_NUM (state, blockNum) {
    state.blockNum = blockNum;
  },
  SET_BALANCE (state, balance) {
    state.balance = balance;
  },
  SET_CONTRACTS (state, contracts) {
    state.contracts = contracts;
  },
  SET_DECIMALS (state, decimals) {
    state.decimals = decimals;
  },
  SET_IS_MEMBER (state, isMember) {
    state.isMember = isMember;
  },
  SET_NETWORK (state, network) {
    state.network = network;
  },
  SET_POST (state, post) {
    Vue.set(state.posts, post.id, post);
  },
  SET_SELECTED_DATES (state, dates) {
    state.selectedDates = dates;
  },
  SET_SELECTED_SUBS (state, subs) {
    state.selectedSubs = subs;
  },
  SET_SUPPLY (state, supply) {
    state.supply = supply;
  },
  ADD_TX (state, tx) {
    state.transactions.push(tx);
  },
  SET_TRANSACTIONS (state, transactions) {
    state.transactions = transactions;
  },
  SET_USERNAME (state, username) {
    state.username = username;
  },
  SET_WEB3 (state, web3) {
    state.web3 = web3;
  }
}

const actions = {
  setAccount ({commit, dispatch, state}, account) {
    console.log("setAccount", account);
    commit("SET_ACCOUNT", account);
    if(!!account) return dispatch("setUsername");
  },
  setAllowance ({commit, dispatch, state}) {
    let {Token, ContentDAO} = state.contracts;
    return Token.methods.allowance(state.account, ContentDAO._address).call().then(res=>commit("SET_ALLOWANCE", res/Math.pow(10, state.decimals)));
  },
  setBalance ({ commit, state }) {
    let {Token} = state.contracts;
    return Token.methods.balanceOf(state.account).call().then(res=>commit("SET_BALANCE", res/Math.pow(10, state.decimals)));
  },
  setContracts ({commit, dispatch, state}) {
    let contracts = [ContentDAOArtifacts, TokenArtifacts, RegistryArtifacts].reduce((prev, artifacts)=>{
      prev[artifacts.contractName] = new web3.eth.Contract(artifacts.abi, artifacts.networks["4"].address);
      return prev;
    }, {});
    commit("SET_CONTRACTS", contracts);
  },
  setUsername ({ commit, dispatch, state }) {
    let {Registry} = state.contracts;
    return Registry.methods.ownerToUsername(state.account).call()
      .then(web3.utils.hexToUtf8)
      .then(username=>commit("SET_USERNAME", username))
      .then(()=>dispatch("setBalance"));
  },
  setKarma ({ commit, state }) {
    let {Registry} = state.contracts;
    return Registry.methods.getKarma(state.username).call().then(res=>commit("SET_KARMA", res));
  },
  async setIsMember ({ commit, state }) {
    let {ContentDAO} = state.contracts;
    let isMember = await ContentDAO.methods.isMember(state.account).call();
    commit("SET_IS_MEMBER", isMember);
  },
  setWeb3 ({ commit, state }) {
    return new Promise((resolve, reject)=>{
      if (typeof web3 !== 'undefined') {
        console.log('Web3 injected browser: OK.')
        window.web3 = new Web3(window.web3.currentProvider);
        commit("SET_WEB3", window.web3)
        resolve(web3);
      } else {
        reject("Web3 not found. Install the MetaMask browser plugin or use a dapp browser like Mist.")
      }
    })
  },
  setDecimals ({ commit, state }) {
    let {Token} = state.contracts;
    return Token.methods.decimals().call().then(res=>commit("SET_DECIMALS", res));
  },
  setBalance ({ commit, state }) {
    let {Token} = state.contracts;
    return Token.methods.balanceOf(state.account).call().then(res=>commit("SET_BALANCE", res/Math.pow(10, state.decimals)));
  },
  setSupply ({ commit, state }) {
    let {Token} = state.contracts;
    return Token.methods.totalSupply().call().then(res=>commit("SET_SUPPLY", res/Math.pow(10, state.decimals)));
  },
  setNetwork ({ commit, state }) {
    return window.web3.eth.net.getId()
      .then(id=>{
        switch (id) {
          case 1:
            commit("SET_NETWORK", NETWORKS.MAIN);
            return NETWORKS.MAIN;
          case 2:
            commit("SET_NETWORK", NETWORKS.MORDEN);
            return NETWORKS.MORDEN;
          case 3:
            commit("SET_NETWORK", NETWORKS.ROPSTEN);
            return NETWORKS.ROPSTEN;
          case 4:
            commit("SET_NETWORK", NETWORKS.RINKEBY);
            return NETWORKS.RINKEBY;
          case 42:
            commit("SET_NETWORK", NETWORKS.KOVAN);
            return NETWORKS.KOVAN;
          default:
            commit("SET_NETWORK", NETWORKS.OTHER);
            return NETWORKS.OTHER;
        }
      });
  },
  async addDate ({ commit, dispatch, state }, date) {
    let res = await dispatch("addArchive", date);
    if(res.ok) commit("ADD_DATE", date);
  },
  addPost ({ commit, dispatch, state }, post) {
    post.created_utc = moment(post.created_utc*1000)
    commit("SET_POST", post);
    if(!state.subs.includes(post.subreddit)) commit("ADD_SUB", post.subreddit);
    dispatch("syncPost", post.id);
  },
  async syncPost ({ commit, state }, id) {
    let {ContentDAO} = state.contracts;
    let idB10 = bases.fromBase36(id);
    let p = await ContentDAO.methods.getPost(idB10).call({from: state.account});
    let stage = parseInt(p.stage);
    if(stage) {
      let post = Object.assign({
        stage,
        ended: p.ended,
        feePaid: p.feePaid,
        liked: p.liked,
        stake: {
          false: parseInt(p.stakeDown),
          true: parseInt(p.stakeUp)
        },
        total: {
          false: parseInt(p.totalDown),
          true: parseInt(p.totalUp)
        },
        startedAt: parseInt(p.startedAt),
        track: parseInt(p.track),
        voted: p.voted,
      }, state.posts[id]);
      commit("SET_POST", post);
    }
  },
  async addArchive({ commit, dispatch, state }, date){
    let res = await fetch(`posts/archive/${date.format(dateFormat)}.json`);
    if(res.ok) {
      let data = await res.json();
      for (let id in data) dispatch("addPost", data[id]);
    }
    return res;
  },
  async addTransaction ({ commit, dispatch, state }, tx) {
    commit("ADD_TX", tx);
    let idx = state.transactions.indexOf(tx);
    try {
      let result = await tx.promise();
      dispatch("updateTransaction", {idx, result});
      return !!web3.utils.hexToNumber(result.status) && typeof tx.success === "function" ? tx.success() : Promise.resolve();
    } catch (error) {
      dispatch("updateTransaction", {idx, error});
      return Promise.reject(error);
    }
  },
  updateTransaction ({ commit, state }, {idx, result, error}) {
    let tx = state.transactions[idx];
    if(result) tx.result = result;
    if(error) tx.error = error;
  },
}

const store = new Vuex.Store({
  state,
  mutations,
  actions
})

export default store
