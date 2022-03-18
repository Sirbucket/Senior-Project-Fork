<script lang="js">
    function navChange(x) {
        x.classList.toggle('change')
        x.closest('section').classList.toggle('opened')
    }

    function menuOpen(x) {
        x.classList.toggle('hidden')
    }
</script>

<section lang=en id="body1">
  <div class="dropdown" on:click={navChange}>
      <div class="bar1"></div>
      <div class="bar2"></div>
      <div class="bar3"></div>
  </div>
  <div class="search hidden">
      <input type="search" maxlength="14" autocomplete="off" placeholder="Search..." disabled>
  </div>
  <div class="home hidden">
      <p>Home</p>
  </div>
  <div class="menu hidden" on:click={menuOpen}>
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
</section>

<style>
section {
    height: 30px;
    display: flex;
    flex-direction: column;
    align-items: start;
    overflow: hidden;
    transition: .5s;
}

.opened {
    height: auto;
}

.hidden {
    display: none;
    overflow: hidden;
}

div {
    height: 15px;
    border: 1px solid black;
    border-radius: 5px;
}

p {
    padding: 0px;
    margin: 0px;
}

.dropdown {
  height: 30px;
  width: 30px;
  display: inline-block;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}

.bar1, .bar2, .bar3 {
  width: 25px;
  height: 5px;
  background-color: #333;
  margin: 6px 0;
  transition: 0.4s;
}

/* Rotate first bar */
.change .bar1 {
  -webkit-transform: rotate(-45deg) translate(-9px, 6px) ;
  transform: rotate(-45deg) translate(-9px, 6px) ;
}

/* Fade out the second bar */
.change .bar2 {
  opacity: 0;
}

/* Rotate last bar */
.change .bar3 {
  -webkit-transform: rotate(45deg) translate(-8px, -8px) ;
  transform: rotate(45deg) translate(-8px, -8px) ;
}
</style>
