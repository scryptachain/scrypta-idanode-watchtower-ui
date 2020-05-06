<template>
  <div id="app">
      <b-navbar>
        <template slot="brand">
          <b-navbar-item tag="router-link" :to="{ path: '/' }">
            <img src="/logo.png" />
          </b-navbar-item>
        </template>
        <template slot="start">
          <b-navbar-item href="/#/">IdaNode network</b-navbar-item>
          <b-navbar-item href="/#/planum">Planum sidechains</b-navbar-item>
        </template>
      </b-navbar>
      <router-view />
      <hr />Scrypta IdaNode Watchtower
      <a
        href="https://github.com/scryptachain/scrypta-idanode-watchtower"
        target="_blank"
      >open-source</a> project by
      <a href="https://scrypta.foundation" target="_blank">Scrypta Foundation</a>.
      <br />
      <br />
  </div>
</template>

<script>
  let ScryptaCore = require("@scrypta/core");

  export default {
    data() {
      return {
        scrypta: new ScryptaCore(true)
      };
    },
    methods: {
    }
  };
  </script>

<style>
  #app {
    font-family: "Sen";
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }

  #nav {
    padding: 30px;
  }

  #nav a {
    font-weight: bold;
    color: #2c3e50;
  }

  #nav a.router-link-exact-active {
    color: #42b983;
  }
</style>