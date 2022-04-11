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
      <div class="classyB button" on:click={styleChange}></div>
    </div>
    <div id="cozy" class="flexy accent">
      <div class="cozyB button" on:click={styleChange}></div>
    </div>
    <div id="cool" class="flexy accent">
      <div class="coolB button" on:click={styleChange}></div>
    </div>
    <div id="carefree" class="flexy accent">
      <div class="carefreeB button" on:click={styleChange}></div>
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
      width: 5vw;
      margin-right: 0.83vw;
      position: relative;
      display: flex;
      font-family: 'Comfortaa', cursive;
    }

    .button {
      height: 1.67vw;
      width: 1.67vw;
      border: 0.17vw solid black;
      border-radius: 0.42vw;
      z-index: 100;
    }

    .buttons {
      height: 12.5vw;
      width: 3.33vw;
      margin-top: 0px;
      margin-right: 0px;
    }

    .flexy {
      width: 2vw;
      margin: 0px;
      padding-left: 0.67vw;
      padding-right: 0.67vw;
      padding-top: 0.6vw;
      padding-bottom: 0.6vw;
    }

    .title {
      text-align: center;
      transform: rotate(90deg);
      height: 2.08vw;
      width: 12.5vw;
      position: absolute;
      top: 5.42vw;
      left: -0.83vw;
    }

    .title p {
      width: 15vw;
      font-size: 1.3vw;
    }

    .tail {
      height: 3.33vw;
      padding: 0px;
      display: flex;
    }

    .tail .left, .tail .right {
      width: 1.67vw;
      height: 1.67vw;
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
