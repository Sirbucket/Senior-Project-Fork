<script>

</script>

<section class="background">
    <div class="main">
    <div class="left base">
        <div class="about text">
            <h2>Introduction:</h2>
            <p>Welcome to Kat's Contemporary Cafe! A student-run pop-up shop dedicated to serving cozy food and warm drinks, perfect for rainy days, a stress-free work break, or even just chilling!</p>
        </div>
        <div class="image accent">
        <img src="images/iacs1.jpg" alt="cool food :)">
        </div>
        <div class="help text">
            <h2>Help Our School:</h2>
            <p>This contemporary cafe is completely non-profit! Any and all proceeds will go back into helping IACS flourish! Funding field trips, helping fund next years senior projects, school building maintenance, and so much more! 
            </p>
        </div>
    </div>
    <div class="right base">
        <div class="image accent">
        <img src="images/logo.png" alt="cool logo :)">
        </div>
        <div class="location text">
            <h2>Location:</h2>
            <p>72 Tyng Rd</p>
            <p>Tyngsboro, Massachusetts</p>
            <p>xxx-xxx-xxxx</p>
            <p>xxx-xxx@gmail.com</p>
            <p>Look for the sign!</p>
        </div>
        <div class="image accent">
        <img src="images/iacs2.jpg" alt="cool food :)">
        </div>
    </div>
    <div class="righter">
        <img id="footsteps" src="images/footsteps.png" class="footsteps" alt="footsteps">
    </div>
    </div>
    <div class="footer text base background">
        <p>Kat's Contemporary Cafe | xxx-xxx-xxxx | xxx-xxx@gmail.com | 72 Tyng Rd, Tyngsboro, Massachusetts
        </p>
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
        width: 300px;
    }

    .left {
        align-items: start;
    }

    .right {
        align-items: end;
    }

    .text {
        height: 200px;
        width: 430px;
        margin-top: 30px;
        margin-bottom: 30px;
        font-family: 'Comfortaa', cursive;
        font-size: 110%;
    }

    h2 {
        border-bottom: 2px solid;
        margin-top: 10px;
    }

    .left img, .right img {
        width: 180px;
        height: 180px;
        background-color: black;
        margin-top: 10px;
        margin-left: 10px;
        margin-right: 10px;
    }

    .image {
        height: 230px;
        width: 200px;
        padding: 0px;
        margin-top: 30px;
        margin-bottom: 30px;
    }

    .about{
        display: flex;
        flex-direction: column;
        align-items: start;
    }

    .location {
        display: flex;
        flex-direction: column;
        align-items: end;
    }

    .location p {
        margin: 0px;
        width: auto;
        text-align: right;
    }

    .help {
        display: flex;
        flex-direction: column;
        align-items: start;
    }

    .righter, .footsteps {
        width: 200px;
    }

    .footer {
        height: 17px;
        width: 85vw;
        border-top: 1px solid;
        margin-left: auto;
        margin-right: auto;
        text-align: center;
    }
</style>
