<template>
  <div class="home">
    <div v-if="!isLoading" style="width:100%; display:block; overflow:hidden;">
      <div class="card" style="margin:1% 10px; width: 48%; float: left;" v-for="node in sync" v-bind:key="node.url">
        <div class="card-content">
          <p class="title">
            {{ node.url }}
          </p>
        </div>
        <footer class="card-footer">
          <p class="card-footer-item">
            <a :href="node.url" target="_blank">
              <span>
                View page
              </span>
            </a>
          </p>
          <p class="card-footer-item">
            <span v-if="node.response.blocks === undefined">
              CHECKING
            </span>
            <span v-if="node.response.blocks !== undefined">
              <span v-if="node.response.toindex === 0" style="color: green">
                SYNCED {{ node.response.blocks }} BLOCKS
              </span>
              <span v-if="node.response.toindex > 0" style="color: orange">
                OUT OF {{ node.response.toindex }} BLOCKS
              </span>
            </span>
          </p>
        </footer>
      </div>
    </div>
    <div v-if="isLoading" style="text-align:center; padding:25vh 0">
      <img src="logo.png" width="100"><br><br>
      Loading IdaNodes Network
    </div>
  </div>
</template>

<script>
  let ScryptaCore = require("@scrypta/core");

  export default {
    data() {
      return {
        scrypta: new ScryptaCore(true),
        nodes: [],
        isLoading: true,
        sync: {},
        blocks: {}
      };
    },
    mounted() {
      const app = this
      app.nodes = app.scrypta.returnNodes()
      for(let x in app.nodes){
        let node = app.nodes[x]
        app.sync[node] = 'CHECKING'
      }
      app.checkNodes()
      setInterval(function() {
        app.checkNodes()
      }, 10000)
    },
    methods: {
      async checkNodes(){
        const app = this
        for(let x in app.nodes){
          let node = app.nodes[x]
          app.sync[node] = {
            "url": node,
            "response": {}
          }
          app.$forceUpdate();
          let response = await app.scrypta.get('/wallet/getinfo', node)
          if(response.toindex !== undefined){
            app.sync[node].response = response
          }
        }
        app.$forceUpdate();
        app.isLoading = false
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
    .card {width:100%!important;; margin: 10px 0!important;}
  }
</style> 