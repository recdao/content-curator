<template>
  <v-app id="recdao-curator">

    <v-navigation-drawer fixed clipped class="grey lighten-4" app v-model="drawer">
      <v-card>
        <v-card-title>Subs</v-card-title>
        <v-divider></v-divider>
        <v-list dense>
          <v-list-tile v-for="sub in subs">
            <v-list-tile-content>
              <v-checkbox :label="sub" :value="sub" v-model="selectedSubs" v-bind:key="sub"></v-checkbox>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-card>
      <v-card>
        <v-card-title style="padding-bottom: 8px">
          <span style="flex-grow: 1">Dates</span>
          <v-btn outline fab small @click.native.stop="dateDialog = !dateDialog" style="margin: 0">
            <v-icon>add</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-list dense>
          <v-list-tile v-for="date in dates">
            <v-list-tile-content>
              <v-checkbox :label="date.format(dateFormat)" :value="date" v-model="selectedDates" v-bind:key="date.format(dateFormat)"></v-checkbox>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-card>
      <v-card>
        <v-card-title>
          <span>Allowance</span>
        </v-card-title>
        <v-divider></v-divider>
        <v-list dense>
          <v-list-tile avatar>
            <v-list-tile-content style="max-width: 50%;">
              <v-text-field solo type="number" v-model="allowance"></v-text-field>
            </v-list-tile-content>
            <v-list-tile-content class="align-end">
              <v-btn outline @click="approve">Update</v-btn>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-card>
    </v-navigation-drawer>

    <v-toolbar color="amber" app fixed clipped-left>
      <v-toolbar-side-icon @click.native="drawer = !drawer"></v-toolbar-side-icon>
      <span class="title ml-3 mr-5">RECDAO&nbsp;<span class="text">Curator</span></span>
    </v-toolbar>

    <v-content id="content">
      <router-view></router-view>
    </v-content>

    <v-footer app fixed>
      <v-layout row justify-space-between class="px-2">
        <div xs2>{{`Account: ${account && account.slice(0,8)}...`}}</div>
        <div xs2>{{`Account REC: ${balance}`}}</div>
        <div xs2>{{`Total REC: ${supply}`}}</div>
        <div xs2>{{`network: ${network}`}}</div>
        <div xs2>{{`block: ${blockNum}`}}</div>
      </v-layout>
    </v-footer>

    <v-dialog v-model="dateDialog">
      <v-card>
        <v-date-picker v-model="picker" min="2018-03-18" :max="today.format(dateFormat)" @input="addDate"></v-date-picker>
      </v-card>
    </v-dialog>

  </v-app>
</template>

<script>
import moment from 'moment';
import { mapState } from 'vuex'

export default {
  components: {},
  data: function (){
    return {
      dateFormat: "YYYY-MM-DD",
      dateDialog: null,
      drawer: null,
      picker: null,
      newAllowance: null,
      today: moment()
    }
  },
  computed: {
    account(){ return this.$store.state.account },
    allowance: {
      get(){ return this.$store.state.allowance },
      set(value){ this.newAllowance = value; }
    },
    balance(){ return this.$store.state.balance },
    blockNum(){ return this.$store.state.blockNum },
    dates(){ return this.$store.state.dates },
    decimals(){ return this.$store.state.decimals; },
    selectedDates: {
      get(){ return this.$store.state.selectedDates },
      set(value){ this.$store.commit('SET_SELECTED_DATES', value) }
    },
    network: function(){ return this.$store.state.network; },
    subs(){ return this.$store.state.subs },
    selectedSubs: {
      get(){ return this.$store.state.selectedSubs },
      set(value){ this.$store.commit('SET_SELECTED_SUBS', value) }
    },
    supply: function(){ return this.$store.state.supply; },
    transactions(){ return this.$store.state.transactions; },
    ContentDAO(){ return this.$store.state.contracts.ContentDAO; },
    Token(){ return this.$store.state.contracts.Token; }
  },
  methods: {
    addDate(date){this.$store.dispatch("addDate", moment(date))},
    approve(){
      console.log(this.newAllowance)
      this.$store.dispatch("addTransaction", {
        label: `Approve ${this.newAllowance} REC`,
        promise: ()=>this.Token.methods.approve(this.ContentDAO._address, this.newAllowance*Math.pow(10, this.decimals)).send({from: this.account, gas: 200000}),
        success: ()=>this.$store.dispatch("setAllowance")
      });
    },
  }
}
</script>

<style>
  .dialog:not(.dialog--fullscreen) {
    width: auto;
  }
</style>
