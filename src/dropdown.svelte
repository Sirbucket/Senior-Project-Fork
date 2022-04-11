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
    margin-top: 10px;
    margin-bottom: 10px;
    width: 80px;
    height: 37px;
    font-size: 110%;
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
    width: 80px;
    transition: height 1s;
    overflow: hidden;
    border-bottom-right-radius: 10px;
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
    margin-top: 63px;
    margin-bottom: 15px;
}

.menu {
    height: 68px;
    transition: height .5s;
    border: 0px;
    width: 75px;
    margin-top: 15px;
    margin-bottom: 15px;
}

.contact {
    margin-top: 25px;
    margin-bottom: 15px;
}

.schedule {
    margin-top: 15px;
    margin-bottom: 15px;
}

.closed {
    height: 20px;
    text-align: center;
}

.opened .stuff {
    display: block;
    overflow: hidden;
    height: 305px;
}

p {
    padding: 0px;
    margin: 0px;
}

.menu p {
    width: 75px;
    text-align: center;
    padding: 0px;
}

.food, .drink {
    margin-top: 4px;
    margin-bottom: 4px;
    margin-right: auto;
    margin-left: auto;
    height: 18px;
    width: 90px;
    display: flex;
    font-size: 80%;
}

.dropdown {
  height: 30px;
  width: 30px;
  padding: 0px;
  border: 0px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  margin-left: 25px;
  margin-top: 25px;
  z-index: 100;
}

.bar1, .bar2, .bar3 {
  width: 30px;
  height: 5px;
  transition: 0.7s;
  border-radius: 2px;
}

/* Rotate first bar */
.change .bar1 {
  transform: rotate(-45deg) translate(-6px, 6px);
}

/* Fade out the second bar */
.change .bar2 {
  opacity: 0;
}

/* Rotate last bar */
.change .bar3 {
  transform: rotate(45deg) translate(-6px, -6px);
}

.ignore {
    position: absolute;
    display: none;
    pointer-events: none;
}
</style>
