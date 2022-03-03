<script>
    import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

    function styleChange(x) {
        let newStyle = x.closest('.flexy')
        dispatch ('styleChange', {
      newStyle
    })
    }
</script>

<html lang=en>
    <div class="title">
      <p>Website Appearance</p>
    </div>
    <div id="classy" class="flexy">
      <button class="classyB" on:click={styleChange(this)}></button>
      <p>Classy</p>
    </div>
    <div id="cozy" class="flexy">
      <button class="cozyB" on:click={styleChange}></button>
      <p>Cozy</p>
    </div>
    <div id="cool" class="flexy">
      <button class="coolB" on:click={styleChange}></button>
      <p>Cool</p>
    </div>
    <div id="carefree" class="flexy">
      <button class="carefreeB" on:click={styleChange}></button>
      <p>Carefree</p>
    </div>
    <div id="celestial" class="flexy">
      <button class="celestialB" on:click={styleChange}></button>
      <p>Celestial</p>
    </div>
</html>

<style>
    html {
        width: 120px;
        height: 230px;
        background-color: red;
    }
</style>
