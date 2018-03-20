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
      <v-container fluid grid-list-md>
        <v-layout row wrap>
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

export default {
  components: {
    Post
  },
  computed: {
    account(){ return this.$store.state.account },
    web3(){ return this.$store.state.web3 },
    network(){ return this.$store.state.network },
    posts(){ return Object.values(this.$store.state.posts) }
  }
}
</script>
