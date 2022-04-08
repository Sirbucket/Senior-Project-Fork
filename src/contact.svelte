<script>

</script>

<section>
    <div class="main">
        <div class="left text">
            <h2>Location:</h2>
            <p>72 Tyng Rd</p>
            <p>Tyngsboro, Massachusetts</p>
            <p>Look for the sign!</p>
        </div>
        <img src="images/logo.png" alt="Cool logo :)">
        <div class="right text">
            <h2>Try Reaching Us Using:</h2>
            <p>xxx-xxx-xxxx</p>
            <p>xxx-xxx@gmail.com</p>
        </div>
    </div>
    <div class="footer text">
        <p>Kat's Contemporary Cafe | xxx-xxx-xxxx | xxx-xxx@gmail.com | 72 Tyng Rd, Tyngsboro, Massachusetts
        </p>
    </div>
</section>

<style>
    .main {
        display: flex;
        justify-content: space-evenly;
        margin-bottom: 180px;
    }

    .text {
        color: white;
        font-size: 110%;
        font-family: 'Comfortaa', cursive;
        width: 250px;
    }

    .left, .right {
        display: flex;
        flex-direction: column;
    }

    .left {
        align-items: start;
    }

    .right {
        align-items: end;
    }

    h2 {
        border-bottom: 2px solid white;
        margin-bottom: 20px;
        font-size: 120%;
    }

    p {
        margin-top: 10px;
        margin-bottom: 10px;
    }

    img {
        width: 250px;
        height: 250px;
        border: 1px solid white;
    }

    .footer {
        height: 17px;
        width: 85vw;
        border-top: 1px solid white;
        margin-left: auto;
        margin-right: auto;
        text-align: center;
    }
</style>