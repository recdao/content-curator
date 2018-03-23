<template>
  <section class="section">
    <div v-if="!web3">
      web3 not found. please install the metamask plugin or use the Mist browser.
    </div>
    <div v-else-if="!['rinkeby', 'other'].includes(network)">
      please switch to the rinkeby network.
    </div>
    <div v-else-if="!account">
      no account found. do you need to unlock metamask?
    </div>
    <div v-else>
      <v-container fluid fill-height class="grey lighten-4" grid-list-xl>
        <v-layout row wrap justify-center>
          <post
            v-for="post in posts"
            v-bind:key="post.id"
            :post="post"
          ></post>
        </v-layout>
      </v-container>
    </div>
  </section>
</template>

<script>
import Post from 'components/Post';
import moment from 'moment';

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
    web3(){ return this.$store.state.web3 },
    network(){ return this.$store.state.network },
    posts(){
      let dateFormat = "YYYY-MM-DD";
      let subs = this.$store.state.selectedSubs;
      let dates = this.$store.state.selectedDates.map(d=>d.format(dateFormat));
      return Object.values(this.$store.state.posts)
              .filter(p=>subs.includes(p.subreddit) &&
                         dates.includes(p.created_utc.format(dateFormat)))
              .sort((a,b)=>b.created_utc-a.created_utc)
    }
  }
}
</script>
