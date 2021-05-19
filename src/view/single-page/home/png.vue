<style>

  .zoom-box {
    width: 380px;
  }

  .tb-pic a {
    display: table-cell;
    text-align: center;
    vertical-align: middle;
  }

  .tb-pic a img {
    vertical-align: middle;
  }

  .tb-pic a {
    *display: block;
    *font-family: Arial;
    *line-height: 1;
  }

  .tb-thumb {
    margin: 10px 0 0;
    overflow: hidden;
  }

  .tb-thumb li {
    background: none repeat scroll 0 0 transparent;
    float: left;
    height: 42px;
    margin: 0 6px 0 0;
    overflow: hidden;
    padding: 1px;
  }

  .tb-s310, .tb-s310 a {
    height: 310px;
    width: 310px;
  }

  .tb-s310, .tb-s310 img {
    max-height: 310px;
    max-width: 310px;
  }

  .tb-s310 a {
    *font-size: 271px;
  }

  .tb-s40 a {
    *font-size: 35px;
  }

  .tb-s40, .tb-s40 a {
    height: 40px;
    width: 40px;
  }

  .tb-booth {
    border: 1px solid #CDCDCD;
    position: relative;
    z-index: 1;
  }

  .tb-thumb .tb-selected {
    background: none repeat scroll 0 0 #C30008;
    height: 40px;
    padding: 2px;
  }

  .tb-thumb .tb-selected div {
    background-color: #FFFFFF;
    border: medium none;
  }

  .tb-thumb li div {
    border: 1px solid #CDCDCD;
  }

  div.zoomDiv {
    z-index: 999;
    position: absolute;
    top: 0px;
    left: 0px;
    width: 50px;
    height: 50px;
    background: #ffffff;
    border: 1px solid #CCCCCC;
    display: none;
    text-align: center;
    overflow: hidden;
  }

  div.zoomMask {
    position: absolute;
    background: url("./mask.png") repeat scroll 0 0 transparent;
    cursor: move;
    z-index: 1;
    width: 50px !important;
    height: 50px !important;
  }

  .jqzoom{
    width: 300px !important;
    height: 300px !important;
  }
  .bigimg{
    width: 700px;
    height: 700px;
  }
</style>
<template>
  <div class="zoom-box">
    <img src="./01.jpg" alt="美女" rel="https://www.jq22.com/demo/jquery-fdj-150220102655/images/05_mid.jpg"
         class="jqzoom"/>
  </div>
</template>

<script>
export default {
  name: 'index',
  mounted () {
    $('.jqzoom').imagezoom()
  }
}
</script>
