<script>
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  function styleChange(event) {
      let newStyle = event.target.closest('.flexy').id
      dispatch ('styleChange', {
        newStyle
      })
  }
</script>

<section>
  <div class="buttons">
    <div id="classy" class="flexy accent">
      <button class="classyB" on:click={styleChange}></button>
    </div>
    <div id="cozy" class="flexy accent">
      <button class="cozyB" on:click={styleChange}></button>
    </div>
    <div id="cool" class="flexy accent">
      <button class="coolB" on:click={styleChange}></button>
    </div>
    <div id="carefree" class="flexy accent">
      <button class="carefreeB" on:click={styleChange}></button>
    </div>
    <div class="tail">
      <div class="left colorTailLeft"></div>
      <div class="right colorTailRight"></div>
    </div>
  </div>
  <div class="title base">
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
      border: 2px solid black;
      border-radius: 5px;
      z-index: 100;
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
      margin: 0px;
      padding: 8px;
    }

    .title {
      text-align: center;
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

    .classyB {
      background-image: linear-gradient(to bottom right, white 50%, black 50%);
    }

    .cozyB {
      background-image: linear-gradient(to bottom right, #783f04 50%, #ead1dc 50%);
    }

    .coolB {
      background-image: linear-gradient(to bottom right, silver 50%, #063970 50%);
    }

    .carefreeB {
      background-image: linear-gradient(to bottom right, #f7ed98 50%, #368a3a 50%);
    }

</style>
