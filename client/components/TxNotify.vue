<template>
  <v-alert :color="alert.color" :icon="alert.icon" dismissible v-model="show" style="width: 100%">
    <span v-html="alert.message({label, txHash, error, network})"></span>
  </v-alert>
</template>



<script>

let alerts = {
  pending: {
    color: "info",
    icon: "info",
    message: ({label})=>`Please wait while your ${label} transaction processes.`
  },
  success: {
    color: "success",
    icon: "check_circle",
    message: ({label, txHash, network})=>`Your ${label} <a href="https://${network}.etherscan.io/tx/${txHash}" target="_blank">transaction</a> succeeded`
  },
  fail: {
    color: "error",
    icon: "warning",
    message: ({label, txHash, network})=>`Your ${label} <a href="https://${network}.etherscan.io/tx/${txHash}" target="_blank">transaction</a> failed`
  },
  error: {
    color: "error",
    icon: "warning",
    message: ({label, error})=>`Your ${label} transaction had an error: ${error}`
  }
}

export default {
  props: {
    label: String,
    result: Object,
    error: Error
  },
  data: function () {
    return {
      alert: alerts.pending,
      show: true,
      txHash: null
    }
  },
  watch: {
    result(res){
      this.setResult(res);
    },
    error(err){
      this.show = true;
    }
  },
  computed: {
    network(){ return this.$store.state.network; },
    pending(){ return !this.result && !this.error; }
  },
  methods: {
    setResult(res){
      this.alert = !!web3.utils.hexToNumber(res.status) ? alerts.success : alerts.fail;
      this.show = true;
      this.txHash = res.transactionHash;
    }
  },
  created(){
    if(this.error) this.alert = alerts.error;
    if(this.result) this.setResult(this.result);
  }
}
</script>
