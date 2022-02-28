<script>
    function menuChange(x) {
        x.classList.toggle('change')
        x.closest(html).classList.toggle('opened')
    }

    function menuOpen(x) {
        x.classList.toggle('hidden')
    }
</script>

<html lang=en>
  <div class="dropdown" on:click={menuChange(this)}>
      <div class="bar1"></div>
      <div class="bar2"></div>
      <div class="bar3"></div>
  </div>
  <div class="search">
      <input type="search" maxlength="14" autocomplete="off" placeholder="Search..." disabled>
  </div>
  <div class="home">
      <p>Home</p>
  </div>
  <div class="menu hidden" on:click={menuOpen(this)}>
      <p>Menu</p>
      <div class="food">
          <p>Food</p>
      </div>
      <div class="drink">
          <p>Drinks</p>
      </div>
  </div>
  <div class="events">
      <p>Events</p>
  </div>
  <div class="hiring">
      <p>Hiring</p>
  </div>
  <div class="faq">
      <p>FAQ</p>
  </div>
</html>

<style>
html {
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

.hidden div {
    height: 0px;
    border: 0px;
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
