<template>
  <v-flex xs12 sm12 md6 lg4 xl3>
    <v-card>
      <v-card-title><h4><a target="_blank" :href="post.url">{{post.title}}</a></h4></v-card-title>
      <v-divider></v-divider>
      <v-list dense>
        <v-list-tile>
          <v-list-tile-content><a target="_blank" :href="`https://www.reddit.com/${post.permalink}`">{{post.subreddit}} comments</a></v-list-tile-content>
          <v-list-tile-content class="align-end">{{date}}</v-list-tile-content>
        </v-list-tile>
        <v-list-tile avatar>
          <v-list-tile-content class="">
            <v-btn :disabled="!!post.stage && !post.liked" outline color="green" @click="doStake(true)">Support</v-btn>
          </v-list-tile-content>
          <v-list-tile-content>
            <v-select solo :items="[50, 100, 150, 300, 600, 1200, 1600, 2400]" v-model="stake" label="Stake" single-line></v-select>
          </v-list-tile-content>
          <v-list-tile-content class="align-end">
            <v-btn :disabled="post.liked" outline color="red" @click="doStake(false)">Reject</v-btn>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-card>
  </v-flex>
</template>

<style>
  a {
    text-decoration: none;
  }
</style>

<script>
import moment from 'moment';
import bases from 'bases';

export default {
  props: {
    post: Object
    // active: Boolean
  },
  data(){
    return {
      date: this.post.created_utc.format("MMMM Do, h:mm a"),
      amount: null,
      stake: 50
    };
  },
  computed: {
    account(){ return this.$store.state.account; },
    blockNum(){ return this.$store.state.blockNum; },
    decimals(){ return this.$store.state.decimals; },
    network(){ return this.$store.state.network; },
    ContentDAO(){ return this.$store.state.contracts.ContentDAO; }
  },
  methods: {
    doStake(vote){
      console.log(bases.fromBase36(this.post.id), vote, this.stake*Math.pow(10, this.decimals))
      this.$store.dispatch("addTransaction", {
        label: `Stake ${this.post.id}`,
        promise: ()=>this.ContentDAO.methods.stake(bases.fromBase36(this.post.id), vote, this.stake*Math.pow(10, this.decimals)).send({from: this.account, gas: 250000}),
        success: ()=>this.$store.dispatch("syncPost", this.post.id)
      });
    },
    test(){

    }
  }
}
</script>
