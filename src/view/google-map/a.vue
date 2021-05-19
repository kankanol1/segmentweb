<template>
  <div style="width: 100%;height: 100%">
    <div id="a-map"></div>
    <div id="a-map1"></div>
    <button id="teleport">teleport</button>
  </div>

</template>

<script>
import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
export default {
  name: 'test',
  components: {},
  data () {
    return {}
  },
  watch: {},
  mounted () {
    var map = new Map({
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: [0, 0],
        zoom: 0
      })
    })
    // map.addLayer(osmLayer);
    map.setTarget('a-map')

    var teleportButton = document.getElementById('teleport')

    teleportButton.addEventListener(
      'click',
      function () {
        var target = map.getTarget() === 'a-map1' ? 'a-map' : 'a-map1'
        map.setTarget(target)
      },
      false
    )

    /*  const view = new View({
          center:fromLonLat([37.41, 8.82],'EPSG:3857'),
          // resolution:111,
          enableRotation:true,//默认值true
          rotation:0,
          zoom:3,
          projection:'EPSG:3857',
          minZoom: 1,
          manZoom:28,
          // zoomFactor:2,
        })
        map.setView(view);
        let flag = 1;
        const speed = 1;
        setInterval(function(){
          if(view.getZoom()>=28){
            flag=-1
          }if(view.getZoom()<=0){
            flag=1
          }
          // view.animate({rotation: view.getRotation() + flag*speed});
          const z = toLonLat(view.getCenter(),'EPSG:3857');
          view.animate({
            // zoom: view.getZoom() + flag*speed,
            center:  fromLonLat([z[0]+flag*2,z[1]+flag*2])
          });
          // console.log(view.getRotation());

        },3000); */
  },
  methods: {}
}
</script>

<style scoped>
  #a-map, #a-map1 {
    width: 100%;
    height: 40%;
  }
</style>
