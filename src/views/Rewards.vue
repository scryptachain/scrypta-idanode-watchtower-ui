<template>
  <div class="home">
    <div v-if="!isLoading" style="width:100%;">
      <div class="columns">
        <div class="column">
          <div class="card">
            <div class="card-content">
              <p class="title">
                {{ Object.keys(stats.uptime).length }}
              </p>
              <p class="subtitle">
                Total IdANodes
              </p>
            </div>
          </div>
        </div>
        <div class="column">
          <div class="card">
            <div class="card-content">
              <p class="title">
                {{ stats.stake.toFixed(3) }} LYRA
              </p>
              <p class="subtitle">
                Total stake
              </p>
            </div>
          </div>
        </div>
        <div class="column">
          <div class="card">
            <div class="card-content">
              <p class="title">
                {{ 1440 - stats.timing }}
              </p>
              <p class="subtitle">
                Minutes until next payout
              </p>
            </div>
          </div>
        </div>
      </div>
      <hr>
      <div class="columns">
        <div class="column">
          <div v-for="(uptime, node) in stats.uptime" v-bind:key="node" style="margin-bottom:15px">
            <a :href="node" target="_blank">
              <div class="card">
                <div class="card-content">
                  <div class="media">
                  <div class="media-left">
                    <figure class="image gravatar is-128x128">
                      <v-gravatar :email="node" />
                    </figure>
                  </div>
                    <div class="media-content">
                      <div class="column" style="text-align:left!important">
                        <p class="title is-4" style="margin:0">{{ node }}</p>
                        <p class="title is-5" style="margin-bottom:0">{{ uptime }} minutes of uptime</p>
                        <p class="title is-5" style="margin-bottom:0">{{ stats.shares[node] }} % of shares</p>
                        <p class="title is-5">{{ stats.earnings[node] }} LYRA at next payout</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
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
        stats: {},
        isLoading: true,
        errors: {}
      };
    },
    mounted() {
      const app = this
      app.fetchStats()
      setInterval(function() {
        app.fetchStats()
      }, 30000)
    },
    methods: {
      async fetchStats(){
        const app = this
        let stats = await axios.get('https://pool.scryptachain.org/status')
        app.stats = stats.data
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
    .gravatar{display:none}
  }
</style> 