<template>
  <v-flex xs12 sm6 md4 lg3>
    <v-card>
      <v-card-title><h4>post</h4></v-card-title>
      <v-divider></v-divider>
      <v-list dense>
        <v-list-tile>
          <v-list-tile-content>id:</v-list-tile-content>
          <v-list-tile-content class="align-end">{{ post.id }}</v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-card>
  </v-flex>
</template>

<script>
export default {
  props: {
    post: Object
    // active: Boolean
  },
  data(){
    return {};
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
