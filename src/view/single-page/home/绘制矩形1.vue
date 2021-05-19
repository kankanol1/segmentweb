<template>
  <div style="width: 100%;height: 100%">
    <div id="map" class="map"></div>
    <div id="popup"><div class="popupStyle">Null Island</div></div>
  </div>

</template>

<script>
  import 'ol/ol.css'

  export default {
    name: "test",
    components: {},
    data() {
      return {}
    },
    watch: {},
    mounted() {

    },
    methods: {}
  }
</script>

<style>
  #map {
    width: 100%;
    height: 400px;
  }

</style>
