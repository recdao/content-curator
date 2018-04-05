<template>
  <v-btn :disabled="!posts.length" color="green" dark @click="doWithdraw">Withdraw All ({{amount}} REC)</v-btn>
</template>

<script>
import moment from 'moment';
import bases from 'bases';
import Promise from 'bluebird';

export default {
  props: {
  },
  data(){
    return {
      maxBatchSize: 5
    };
  },
  computed: {
    account(){ return this.$store.state.account; },
    amount(){
      return this.posts.reduce((prev, curr)=>prev += curr.stake[curr.liked], 0);
    },
    ContentDAO(){ return this.$store.state.contracts.ContentDAO; },
    posts(){
      return Object.values(this.$store.state.posts)
        .filter(p=>(p.ended && p.stake[p.liked] > 0))
    }
  },
  methods: {
    doWithdraw(){
      if(this.posts.length > 5) {
        alert("You have more than 5 markets to withdraw from. To optimise on gas this transaction will batch 5 withdrawals together until all have been withdrawn. After each transaction it may help to refresh the page.")
      }
      let batch = this.posts.slice(0,5).map(p=>p.id).map(bases.fromBase36);
      this.$store.dispatch("addTransaction", {
        label: `Withdraw Batch`,
        promise: ()=>this.ContentDAO.methods.withdraw(batch).send({from: this.account, gas: 200000}),
        success: async ()=>await Promise.mapSeries(batch, async (p)=>this.$store.dispatch("syncPost", p.id))
      });
    }
  }
}
</script>
