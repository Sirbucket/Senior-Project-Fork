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
  <div class="buttons">
    <div id="classy" class="flexy">
      <button class="classyB" on:click={styleChange}></button>
    </div>
    <div id="cozy" class="flexy">
      <button class="cozyB" on:click={styleChange}></button>
    </div>
    <div id="cool" class="flexy">
      <button class="coolB" on:click={styleChange}></button>
    </div>
    <div id="carefree" class="flexy">
      <button class="carefreeB" on:click={styleChange}></button>
    </div>
    <div class="tail">
      <div class="left"></div>
      <div class="right"></div>
    </div>
  </div>
  <div class="title">
    <p>Website Appearance</p>
  </div>
</section>

<style>
    section {
      width: 60px;
      margin-right: 10px;
      position: relative;
      display: flex;
    }

    button {
      height: 24px;
      width: 24px;
    }

    .buttons {
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      align-items: center;
      height: 150px;
      width: 40px;
      margin-top: 15px;
      margin-right: 0px;
    }

    .flexy {
      background-color: white;
      margin: 0px;
      padding: 8px;
    }

    .title {
      text-align: center;
      color: white;
      transform: rotate(90deg);
      height: 25px;
      width: 150px;
      position: absolute;
      top: 65px;
      left: -10px;
    }

    .title p {
      width: 150px;
    }

    .tail {
      height: 40px;
      padding: 0px;
      display: flex;
    }

    .tail .left, .tail .right {
      width: 20px;
      height: 20px;
    }

    .tail .left {
      background-image: linear-gradient(to bottom right, white 50%, #00000000 50%);
    }

    .tail .right {
      background-image: linear-gradient(to bottom left, white 50%, #00000000 50%)
    }

</style>
