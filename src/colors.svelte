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

<section>
    <div class="title">
      <p>Website Appearance</p>
    </div>
    <div id="classy" class="flexy">
      <button class="classyB" on:click={styleChange}></button>
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
    <div class="tail">
      <div class="left"></div>
      <div class="right"></div>
    </div>
  </section>

<style>
    section {
      width: 100px;
      font-size: 75%;
      margin-right: 5px;
    }
    
    div, p {
      margin: 0px;
      padding: 2px;
    }

    div {
      display: flex;
      align-items: center
    }

    button {
      height: 17px;
      width: 17px;
    }

    .flexy {
      background-color: green;
    }

    .title {
      text-align: center;
      background-color: green;
    }

    .tail {
      height: 50px;
      padding: 0px;
      display: flex;
    }

    .tail .left, .tail .right {
      width: 50px;
      height: 50px;
    }

    .tail .left {
      background-image: linear-gradient(to bottom right, green 50%, #00000000 50%);
    }

    .tail .right {
      background-image: linear-gradient(to bottom left, green 50%, #00000000 50%)
    }

</style>
