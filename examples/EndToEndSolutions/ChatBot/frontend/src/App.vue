<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
html, body, #app{
  width: 100%;
  height: 100%;
}

body {
  margin: 0;
  padding: 0;
  background-color: #fff;
}

.md-dialog{
  z-index: 10;
}

.md-dialog-container{
  min-width: 600px !important;
}

@font-face {
  font-family: 'Material Icons';
  font-style: normal;
  font-weight: 400;
  src: url(/static/material-design-icons-2.0/iconfont/MaterialIcons-Regular.eot); /* For IE6-8 */
  src: local('Material Icons'),
  local('MaterialIcons-Regular'),
  url(/static/material-design-icons-2.0/iconfont/MaterialIcons-Regular.woff2) format('woff2'),
  url(/static/material-design-icons-2.0/iconfont/MaterialIcons-Regular.woff) format('woff'),
  url(/static/material-design-icons-2.0/iconfont/MaterialIcons-Regular.ttf) format('truetype');
}

.material-icons {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;  /* Preferred icon size */
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;

  /* Support for all WebKit browsers. */
  -webkit-font-smoothing: antialiased;
  /* Support for Safari and Chrome. */
  text-rendering: optimizeLegibility;

  /* Support for Firefox. */
  -moz-osx-font-smoothing: grayscale;

  /* Support for IE. */
  font-feature-settings: 'liga';
}
</style>
