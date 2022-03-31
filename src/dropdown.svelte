<script lang="js">
    function navChange(event) {
        let x = event.target.closest('.dropdown')
        x.classList.toggle('change')
        x.closest('section').classList.toggle('opened')
    }

    function menuOpen(event) {
        let x = event.target.closest('.hidden')
        x.classList.toggle('closed')
        x.classList.toggle('visible')
    }
</script>

<section lang=en>
  <div class="dropdown" on:click={navChange}>
      <div class="bar1"></div>
      <div class="bar2"></div>
      <div class="bar3"></div>
  </div>
  <div class="stuff">
  <div class="search hidden">
      <input type="search" maxlength="7" autocomplete="off" placeholder="Search..." disabled>
  </div>
  <div class="home hidden">
      <p>Home</p>
  </div>
  <div class="menu hidden closed" on:click={menuOpen}>
      <p>Menu</p>
      <div class="food">
          <p>Food</p>
      </div>
      <div class="drink">
          <p>Drinks</p>
      </div>
  </div>
  <div class="events hidden">
      <p>Events</p>
  </div>
  <div class="hiring hidden">
      <p>Hiring</p>
  </div>
  <div class="faq hidden">
      <p>FAQ</p>
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
    transition: .5s;
    position: relative;
}

section.opened {
    height: 90vh;
}

.hidden {
    display: none;
    overflow: hidden;
    cursor: pointer;
}

.opened .stuff {
    display: block;
    overflow: hidden;
    margin: 10px;
    height: 90vh;
    width: 150px;
}

.opened .stuff .hidden {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    margin: 10px;
    height: 15px;
}

.opened .stuff .menu {
    justify-content: start;
}

.menu {
    height: 50px;
}

.closed {
    height: 15px;
}

.visible {
    height: 55px;
}

input {
    width: 140px;
}

.stuff {
    position: absolute;
    top: 15px;
    left: -10px;
    border: 0px;
    height: 0px;
    transition: height 1s;
}

.opened .stuff {
    height: 185px;
}

div {
    height: 15px;
    border: 1px solid black;
    border-radius: 3px;
}

p {
    padding: 0px;
    margin: 0px;
}

.faq {
    margin-bottom: auto;
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
}

.bar1, .bar2, .bar3 {
  width: 25px;
  height: 3px;
  background-color: #333;
  transition: 0.7s;
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
