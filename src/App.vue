<template>
  <div id="app">
    <Header id="header"></Header>
    <router-view/>
  </div>
</template>

<script>
require('dotenv').config()
import Header from '@/components/Layout/Header'
export default {
    name: 'App',
    components: {
        Header: Header
    }
}
</script>

<style>
#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
}

#header {
    text-align: left;
}
</style>
