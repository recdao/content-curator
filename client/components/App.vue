<template>
  <v-app id="ethtrader">
    <v-content>
      <v-container >
        <router-view></router-view>
      </v-container>
    </v-content>
    <v-layout column style="position: fixed; bottom: 32px; width: 100%">
    </v-layout>
    <v-footer app fixed>
      <v-layout row justify-space-between>
        <span xs2>&copy; 2018</span>
        <div xs2>{{'Total REC: '+ supply}}</div>
        <div xs2>{{'network: '+ network}}</div>
        <div xs2>{{'block: '+ blockNum}}</div>
      </v-layout>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  components: {
  },
  data: function (){
    return {
    }
  },
  computed: {
    blockNum(){ return this.$store.state.blockNum },
    network: function(){ return this.$store.state.network; },
    supply: function(){ return this.$store.state.supply; },
    transactions(){ return this.$store.state.transactions; }
  }
}
</script>
