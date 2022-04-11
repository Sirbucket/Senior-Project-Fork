<script>
    import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

    function navChange(event) {
        let x = event.target.closest('.dropdown')
        x.classList.toggle('change')
        x.closest('section').classList.toggle('opened')
    }

    function menuOpen(event) {
        let x = event.target.closest('.menu')
        x.classList.toggle('closed')
        x.classList.toggle('visible')
    }

    function pageChange(event) {
        let x = event.target.closest('div').classList[0]
        dispatch ('pageChange', {
            newPage: x
        })
    }
</script>

<section lang=en>
  <div class="dropdown" on:click={navChange}>
      <div class="bar1"></div>
      <div class="bar2"></div>
      <div class="bar3"></div>
  </div>
  <div class="stuff accent">
  <div class="home hidden" on:click={pageChange}>
      <p>Home</p>
  </div>
  <div class="menu hidden closed">
      <p on:click={menuOpen}>Menu</p>
      <div class="food" on:click={pageChange}>
          <p>Food</p>
      </div>
      <div class="drink" on:click={pageChange}>
          <p>Drinks</p>
      </div>
  </div>
  <div class="contact hidden" on:click={pageChange}>
      <p>Contact<br>Us</p>
  </div>
  <div class="schedule hidden" on:click={pageChange}>
      <p>Schedule</p>
  </div>
  </div>
  <section class="ignore visible opened change">
      <div class="bar1 bar2 bar3 stuff"></div>
  </section>
</section>

<style>
section {
    display: flex;
    flex-direction: column;
    align-items: start;
}

section.opened {
    height: 90vh;
}

.hidden {
    overflow: hidden;
    cursor: pointer;
    margin-top: 0.83vw;
    margin-bottom: 0.83vw;
    width: 6.67vw;
    height: 3.08;
    font-size: 1.5vw;
    text-align: center;
}

.hidden p {
    transition: .5s;
}

.hidden p:hover {
    transform: scale(1.1, 1.1)
}

.stuff {
    position: absolute;
    top: 0px;
    left: 0px;
    border: 0px;
    height: 0px;
    width: 6.67vw;
    transition: height 1s;
    overflow: hidden;
    border-bottom-right-radius: 0.83vw;
}

.stuff .hidden {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.stuff .menu {
    justify-content: start;
}

.home {
    margin-top: 5.25vw;
    margin-bottom: 1.25vw;
}

.menu {
    height: 5.67vw;
    transition: height .5s;
    border: 0px;
    width: 6.25vw;
    margin-top: 1.25vw;
    margin-bottom: 1.25vw;
}

.contact {
    margin-top: 1.25vw;
    margin-bottom: 1.25vw;
}

.schedule {
    margin-top: 1.25vw;
    margin-bottom: 1.25vw;
}

.closed {
    height: 1.67vw;
    text-align: center;
}

.opened .stuff {
    display: block;
    overflow: hidden;
    height: 23.5vw;
}

p {
    padding: 0px;
    margin: 0px;
}

.menu p {
    width: 6.25vw;
    text-align: center;
    padding: 0px;
}

.food, .drink {
    margin-top: 0.33vw;
    margin-bottom: 0.33vw;
    margin-right: auto;
    margin-left: auto;
    height: 1.5vw;
    width: 7.5vw;
    display: flex;
    font-size: 1.36vw;
}

.dropdown {
  height: 2.5vw;
  width: 2.5vw;
  padding: 0px;
  border: 0px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  margin-left: 2.08vw;
  margin-top: 2.08vw;
  z-index: 100;
}

.bar1, .bar2, .bar3 {
  width: 2.5vw;
  height: 0.42vw;
  transition: 0.7s;
  border-radius: 0.17vw;
}

/* Rotate first bar */
.change .bar1 {
  transform: rotate(-45deg) translate(-0.5vw, 0.5vw);
}

/* Fade out the second bar */
.change .bar2 {
  opacity: 0;
}

/* Rotate last bar */
.change .bar3 {
  transform: rotate(45deg) translate(-0.5vw, -0.5vw);
}

.ignore {
    position: absolute;
    display: none;
    pointer-events: none;
}
</style>
