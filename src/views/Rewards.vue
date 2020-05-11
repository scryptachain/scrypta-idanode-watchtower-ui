<template>
  <div class="home">
    <div v-if="!isLoading" style="width:100%;">
      
    </div>
    <div v-if="isLoading" style="text-align:center; padding:25vh 0">
      <img src="logo.png" width="100"><br><br>
      Loading IdaNodes Rewards
    </div>
  </div>
</template>

<script>
  let ScryptaCore = require("@scrypta/core");
  const axios = require('axios')
  export default {
    data() {
      return {
        scrypta: new ScryptaCore(true),
        nodes: [],
        sidechains: [],
        status: {},
        isLoading: true,
        errors: {}
      };
    },
    mounted() {
      const app = this
      app.nodes = app.scrypta.returnNodes()
      
      app.fetchSidechains()
      setInterval(function() {
        // app.checkNodes()
      }, 10000)
    },
    methods: {
      async fetchSidechains(){
        const app = this
        let response = await app.scrypta.get('/sidechain/list')
        for(let x in response.data){
          let sidechain = response.data[x]
          app.status[sidechain.address] = {}
        }
        app.sidechains = response.data
        app.checkNodes()
        app.isLoading = false
      },
      async checkNodes(){
        const app = this
        for(let xxx in app.sidechains){
          let sidechain = app.sidechains[xxx].address
          // console.log('CHECKING SIDECHAIN ' + sidechain)
          const responses = {}
          app.sidechains[xxx].cap = '-'
          app.sidechains[xxx].burned = '-'

          for(let node in app.nodes){
            try{
              // console.log('CHECKING NODE ' + app.nodes[node])
              app.status[sidechain][app.nodes[node]] = 'CHECKING'
              app.errors[sidechain] = ''
              app.$forceUpdate();
              let response = await axios.post(app.nodes[node] + '/sidechain/shares', {sidechain_address: sidechain})
              responses[app.nodes[node]] = response.data
              app.status[sidechain][app.nodes[node]] = response.data.cap + ' ' + app.sidechains[xxx].genesis.symbol + ' | ' + response.data.burned + ' ' + app.sidechains[xxx].genesis.symbol
              app.$forceUpdate();
            }catch(e){
              // console.log('NODE ' + app.nodes[node] + ' NOT AVAILABLE')
            }
          }
          let same = []
          let burned = []
          let difference = []
          for(let x in responses){
            if(same.length === 0){
              same.push(responses[x].cap)
            }else{
              let lastindex = same.length - 1
              if(same[lastindex] === responses[x].cap){
                same.push(responses[x].cap)
                burned.push(responses[x].burned)
              }else{
                difference.push(x)
              }
            }
          }
          // console.log(same.length + ' NODES ARE EQUALS, TOTAL CAP IS ' + same[0])
          app.sidechains[xxx].cap = same[0]
          app.sidechains[xxx].burned = burned[0]
          let balances = {}

          for(let x in responses){
            for(let y in responses[x].shares){
              //// console.log('CHECKING ' + y + ' BALANCE: ' + responses[x].shares[y].balance)
              if(balances[y] === undefined){
                balances[y] = [responses[x].shares[y].balance]
              }else{
                let lastindex =  balances[y].length - 1
                if(balances[y][lastindex] === responses[x].shares[y].balance){
                  balances[y].push(responses[x].shares[y].balance)
                }else{
                  app.errors[sidechain] += y + ' BALANCE IS DIFFERENT ON NODE ' + x + "\n"
                }
              }
            }
          }
          global['isChecking'] = false
          // console.log('CHECKING ENDED')
        }
      }
    }
  };
</script>
<style>
  .home{
    padding: 20px;
  }
  @media screen and (max-width:768px){
    .title{ font-size: 14px; }
    .gravatar{display:none}
  }
</style> 