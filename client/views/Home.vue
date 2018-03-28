<template>
  <section class="section">
    <div v-if="!web3">
      web3 not found. please install the metamask plugin or use the Mist browser.
    </div>
    <div v-else-if="!['rinkeby', 'other'].includes(network)">
      please switch to the rinkeby network.
    </div>
    <v-container v-else fluid fill-height class="grey lighten-4" grid-list-xl>
      <v-layout row wrap justify-center>
        <post
          v-for="post in posts"
          v-bind:key="post.id"
          :post="post"
        ></post>
      </v-layout>
    </v-container>
  </section>
</template>

<script>
import Post from 'components/Post';
import moment from 'moment';
import { FILTERS as FILTER_OPTIONS } from 'constants.json';

export default {
  components: {
    Post
  },
  data(){
    return {
    };
  },
  computed: {
    account(){ return this.$store.state.account },
    filters(){ return this.$store.state.filters },
    network(){ return this.$store.state.network },
    posts(){
      let dateFormat = "YYYY-MM-DD";
      let subs = this.$store.state.selectedSubs;
      let dates = this.$store.state.selectedDates.map(d=>d.format(dateFormat));
      return Object.values(this.$store.state.posts)
              .filter(p=>{
                if( !subs.includes(p.subreddit) ) return false;
                if( !dates.includes(p.created_utc.format(dateFormat)) ) return false;
                if( !this.filters.includes(FILTER_OPTIONS.ENDED) && p.ended ) return false;
                if( !this.filters.includes(FILTER_OPTIONS.IN_ARBITRATION) && !p.ended && p.stage === 2 ) return false;
                if( !this.filters.includes(FILTER_OPTIONS.REJECTED) && p.liked === false ) return false;
                if( !this.filters.includes(FILTER_OPTIONS.SUPPORTED) && p.liked === true ) return false;
                if( !this.filters.includes(FILTER_OPTIONS.NOT_STARTED) && !p.hasOwnProperty("liked") ) return false;
                return true;
              })
              .sort((a,b)=>b.created_utc-a.created_utc)
    },
    web3(){ return this.$store.state.web3 }
  }
}
</script>
