<script>

</script>

<section>
    <div class="main">
    <div class="left">
        <div class="about text">
            <h2>About Us</h2>
            <p>We're pretty epic. Pretty awesome. We make stuff and you buy it. This is some more text to fill the space so I can see what it looks like. It looks pretty good so far, but here's even more text now.</p>
        </div>
        <img class="image2" alt="cool food :)">
        <div class="allergy text">
            <h2>Allergy & Diet</h2>
            <p>We're pretty epic. Pretty awesome. We make stuff and you buy it. This is some more text to fill the space so I can see what it looks like. It looks pretty good so far, but here's even more text now.</p>
        </div>
        <img class="image4" alt="cool food :)">
    </div>
    <div class="right">
        <img src="images/logo.png" class="image1" alt="cool logo :)">
        <div class="location text">
            <h2>Location</h2>
            <p>We're pretty epic. Pretty awesome. We make stuff and you buy it. This is some more text to fill the space so I can see what it looks like. It looks pretty good so far, but here's even more text now.</p>
        </div>
        <img class="image3" alt="cool food :)">
        <div class="charity text">
            <h2>Charity/Profit</h2>
            <p>We're pretty epic. Pretty awesome. We make stuff and you buy it. This is some more text to fill the space so I can see what it looks like. It looks pretty good so far, but here's even more text now.</p>
        </div>
    </div>
    </div>
    <div class="legal">
        <h4>Please don't sue us :)</h4>
    </div>
</section>

<style>
    section {
        display: flex;
        flex-direction: column;
        width: 100vw;
        position: relative;
    }

    .main {
        display: flex;
        justify-content: space-evenly;
        width: 100vw;
        margin: 0px;
        padding: 0px;
        border: 0px;
    }

    .left, .right {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
    }

    .text {
        height: 200px;
        width: 200px;
        border: 2px solid black;
        margin-top: 30px;
        margin-bottom: 30px;
        text-align: center;
    }

    h2 {
        border-bottom: 2px solid black;
        width: 80%;
        margin-left: auto;
        margin-right: auto;
        margin-top: 10px;
    }

    img {
        width: 200px;
        height: 200px;
        border: 2px solid black;
        margin-top: 30px;
        margin-bottom: 30px;
    }

    .legal {
        width: 100vw;
        background-color: #00000055;
        color: white;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
