<template>
  <div class="planum">
    <div v-if="!isLoading" style="width: 100%">
      <div
        v-for="sidechain in sidechains"
        v-bind:key="sidechain.address"
        style="margin-bottom: 15px"
      >
        <a
          :href="'https://chains.planum.dev/#/sidechain/' + sidechain.address"
          target="_blank"
        >
          <div class="card">
            <div class="card-content">
              <div class="media">
                <div class="media-left">
                  <figure class="image gravatar is-128x128">
                    <v-gravatar :email="sidechain.address" />
                  </figure>
                </div>
                <div class="media-content">
                  <div class="columns">
                    <div class="column">
                      <p class="title is-4" style="margin: 0">
                        {{ sidechain.genesis.name }}
                      </p>
                      <p class="title is-5" style="margin-bottom: 0">
                        {{ sidechain.last_24 }} txs in the last 24h
                      </p>
                      <p class="title is-5" style="margin-bottom: 0">
                        {{ sidechain.cap }} {{ sidechain.genesis.symbol }} total
                        CAP
                      </p>
                      <p class="title is-5">
                        {{ sidechain.burned }}
                        {{ sidechain.genesis.symbol }} total BURNED
                      </p>
                      <p class="subtitle is-6" style="margin-bottom: 0">
                        issued at
                        <b style="color: #000">{{ sidechain.address }}</b>
                      </p>
                    </div>
                    <div class="column">
                      <div
                        style="font-size: 14px"
                        v-for="node in nodes"
                        v-bind:key="node"
                      >
                        <div v-if="status[sidechain.address] !== undefined">
                          <div
                            v-if="status[sidechain.address][node] !== undefined"
                          >
                            {{ node }}: {{ status[sidechain.address][node] }}
                          </div>
                          <div
                            v-if="status[sidechain.address][node] === undefined"
                          >
                            {{ node }}: CHECKING
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <pre v-if="errors[sidechain.address]">{{
                    errors[sidechain.address]
                  }}</pre>
                </div>
              </div>
            </div>
          </div>
        </a>
      </div>
    </div>
    <div v-if="isLoading" style="text-align: center; padding: 25vh 0">
      <img src="planum.png" width="100" /><br /><br />
      Loading Planum Sidechains
    </div>
  </div>
</template>

<script>
let ScryptaCore = require("@scrypta/core");
const axios = require("axios");
export default {
  data() {
    return {
      scrypta: new ScryptaCore(true),
      nodes: [],
      sidechains: [],
      status: {},
      isLoading: true,
      errors: {},
    };
  },
  async mounted() {
    const app = this;
    app.nodes = await app.scrypta.returnNodes();

    app.fetchSidechains();
    setInterval(function () {
      // app.checkNodes()
    }, 10000);
  },
  methods: {
    async fetchSidechains() {
      const app = this;
      let response = await app.scrypta.get("/sidechain/list");
      for (let x in response.data) {
        let sidechain = response.data[x];
        app.status[sidechain.address] = {};
      }
      app.sidechains = response.data;
      app.checkNodes();
      app.isLoading = false;
    },
    async checkNodes() {
      const app = this;
      for (let xxx in app.sidechains) {
        let sidechain = app.sidechains[xxx].address;
        // console.log('CHECKING SIDECHAIN ' + sidechain)
        const responses = {};
        app.sidechains[xxx].cap = "-";
        app.sidechains[xxx].burned = "-";

        for (let node in app.nodes) {
          try {
            // console.log('CHECKING NODE ' + app.nodes[node])
            app.status[sidechain][app.nodes[node]] = "CHECKING";
            let getinfo = await axios
              .get(app.nodes[node] + "/wallet/getinfo", { timeout: 5000 })
              .catch(() => {
                app.status[sidechain][app.nodes[node]] = "NODE NOT WORKING";
              });

            if (getinfo.data.toindex <= 1) {
              app.errors[sidechain] = "";
              app.$forceUpdate();
              let response = await axios
                .post(
                  app.nodes[node] + "/sidechain/shares",
                  { sidechain_address: sidechain },
                  { timeout: 5000 }
                )
                .catch(() => {
                  app.status[sidechain][app.nodes[node]] = "NODE NOT WORKING";
                });
              if (response.data !== undefined) {
                responses[app.nodes[node]] = response.data;
                app.status[sidechain][app.nodes[node]] =
                  response.data.cap +
                  " " +
                  app.sidechains[xxx].genesis.symbol +
                  " | " +
                  response.data.burned +
                  " " +
                  app.sidechains[xxx].genesis.symbol;
                app.$forceUpdate();
              }
            } else {
              app.status[sidechain][app.nodes[node]] = "NODE OUT OF SYNC";
            }
          } catch (e) {
            app.status[sidechain][app.nodes[node]] = "NODE NOT WORKING";
            // console.log('NODE ' + app.nodes[node] + ' NOT AVAILABLE')
          }
        }
        let same = [];
        let burned = [];
        let difference = [];
        for (let x in responses) {
          if (same.length === 0) {
            same.push(responses[x].cap);
          } else {
            let lastindex = same.length - 1;
            if (same[lastindex] === responses[x].cap) {
              same.push(responses[x].cap);
              burned.push(responses[x].burned);
            } else {
              difference.push(x);
            }
          }
        }
        // console.log(same.length + ' NODES ARE EQUALS, TOTAL CAP IS ' + same[0])
        app.sidechains[xxx].cap = same[0];
        app.sidechains[xxx].burned = burned[0];
        let balances = {};

        for (let x in responses) {
          for (let y in responses[x].shares) {
            //// console.log('CHECKING ' + y + ' BALANCE: ' + responses[x].shares[y].balance)
            if (balances[y] === undefined) {
              balances[y] = [responses[x].shares[y].balance];
            } else {
              let lastindex = balances[y].length - 1;
              if (balances[y][lastindex] === responses[x].shares[y].balance) {
                balances[y].push(responses[x].shares[y].balance);
              } else {
                app.errors[sidechain] +=
                  y + " BALANCE IS DIFFERENT ON NODE " + x + "\n";
              }
            }
          }
        }
        global["isChecking"] = false;
        // console.log('CHECKING ENDED')
      }
    },
  },
};
</script>
<style>
.planum .card * {
  text-align: left!important;
}
.home, .planum {
  padding: 20px;
}
@media screen and (max-width: 768px) {
  .title {
    font-size: 14px;
  }
  .gravatar {
    display: none;
  }
}
</style> 