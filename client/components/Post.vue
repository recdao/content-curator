<template>
  <v-flex xs12 sm12 md6 lg4 xl3>
    <v-card>
      <v-card-title>
        <h4>
          <v-icon :color="post.liked === true ? 'green' : post.liked === false ? 'red' : ''" style="font-size: inherit; margin-right: 4px;">
            {{post.liked === true ? 'thumb_up' : post.liked === false ? 'thumb_down' : 'thumbs_up_down'}}
          </v-icon>
          <a target="_blank" :href="post.url">{{post.title}}</a></h4>
      </v-card-title>
      <v-divider></v-divider>
      <v-list dense>
        <v-list-tile>
          <v-list-tile-content><a target="_blank" :href="`https://www.reddit.com${post.permalink}`">{{post.subreddit}} comments</a></v-list-tile-content>
          <v-list-tile-content class="align-end">{{date}}</v-list-tile-content>
        </v-list-tile>
        <v-list-tile avatar v-if="post.ended">
          <v-list-tile-content class="align-center">
            <v-btn v-if="post.stake[post.liked] > 0" color="green" dark @click="doWithdraw">Withdraw {{post.stake[post.liked]/Math.pow(10, decimals)}}</v-btn>
            <span v-else>Staking has ended</span>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile avatar v-else-if="post.stage === 2">
          <span v-if="!isMember">Result requires adjudication</span>
          <span v-else-if="!post.voted">Please adjudicate below</span>
          <span v-else>Thank you for adjudicating</span>
        </v-list-tile>
        <v-list-tile avatar v-else>
          <v-list-tile-content class="align-end">
            <v-btn :disabled="!!post.stage && !post.liked" flat icon color="red" @click="doStake(false)"><v-icon>thumb_down</v-icon></v-btn>
          </v-list-tile-content>
          <v-list-tile-content style="max-width: 100px" class="stake">
            <v-text-field type="number" solo label="Stake" v-model="stake"></v-text-field>
            <!-- <v-select solo :items="[50, 100, 150, 300, 600, 1200, 1600, 2400]" v-model="stake" label="Stake" single-line></v-select> -->
          </v-list-tile-content>
          <v-list-tile-content>
            <v-btn :disabled="!!post.liked" flat icon color="green" @click="doStake(true)"><v-icon>thumb_up</v-icon></v-btn>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile avatar v-if="post.stage === 2 && isMember && !post.voted">
          <v-list-tile-content class="align-end">
            <v-btn flat icon color="red" @click="doVote(false)"><v-icon>thumb_down</v-icon></v-btn>
          </v-list-tile-content>
          <v-list-tile-content>
            <v-btn flat icon color="green" @click="doVote(true)"><v-icon>thumb_up</v-icon></v-btn>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-card>
  </v-flex>
</template>

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
      userStake: null
    };
  },
  computed: {
    account(){ return this.$store.state.account; },
    allowance(){ return this.$store.state.allowance; },
    balance(){ return this.$store.state.balance; },
    blockNum(){ return this.$store.state.blockNum; },
    decimals(){ return this.$store.state.decimals; },
    isMember(){ return this.$store.state.isMember; },
    network(){ return this.$store.state.network; },
    stake: {
      get(){
        return this.userStake || (
          this.post.hasOwnProperty("liked") ?
          (2*this.post.total[this.post.liked] - this.post.total[!this.post.liked])/Math.pow(10, this.decimals) :
          50
        );
      },
      set(val){ this.userStake = val; }
    },
    ContentDAO(){ return this.$store.state.contracts.ContentDAO; }
  },
  methods: {
    doStake(vote){
      if(this.stake > this.balance) {
        alert(`You cannot stake an amount (${stake}) greater than your RECT balance (${this.balance}).`);
        return;
      }
      if(this.stake > this.allowance) {
        alert(`Please increase your allowance to at least ${stake}.`);
        return;
      }
      let args = [bases.fromBase36(this.post.id), vote, this.stake*Math.pow(10, this.decimals)]
      console.log(args)
      this.$store.dispatch("addTransaction", {
        label: `Stake ${this.post.id}`,
        promise: ()=>this.ContentDAO.methods.stake(...args).send({from: this.account, gas: 250000}),
        success: ()=>this.$store.dispatch("syncPost", this.post.id)
      });
    },
    doWithdraw(){
      console.log(bases.fromBase36(this.post.id))
    }
  }
}
</script>

<style>
  a {
    text-decoration: none;
  }
  .stake.list__tile__content .input-group--text-field input {
    text-align: center;
    margin-right: -14px;
  }
</style>
