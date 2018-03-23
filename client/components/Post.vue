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

export default {
  props: {
    post: Object
    // active: Boolean
  },
  data(){
    return {
      date: moment(this.post.created_utc*1000).format("MMMM Do, h:mm a")
    };
  },
  computed: {
    account(){ return this.$store.state.account; },
    blockNum(){ return this.$store.state.blockNum; },
    network(){ return this.$store.state.network; },
    ContentDAO(){ return this.$store.state.contracts.ContentDAO; }
  },
  methods: {
  }
}
</script>
