<script>

</script>

<section class="background">
    <div class="main">
        <div class="left text base">
            <h2>Location:</h2>
            <p>72 Tyng Rd</p>
            <p>Tyngsboro, Massachusetts</p>
            <p>Look for the sign!</p>
        </div>
        <div class="image">
        <img src="images/logo.png" alt="Cool logo :)">
        </div>
        <div class="right text base">
            <h2>Try Reaching Us Using:</h2>
            <p>xxx-xxx-xxxx</p>
            <p>xxx-xxx@gmail.com</p>
        </div>
    </div>
    <div class="footer text base background">
        <p>Kat's Contemporary Cafe | xxx-xxx-xxxx | xxx-xxx@gmail.com | 72 Tyng Rd, Tyngsboro, Massachusetts
        </p>
    </div>
</section>

<style>
    .main {
        display: flex;
        justify-content: space-evenly;
        margin-bottom: 155px;
    }

    .text {
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
        border-bottom: 2px solid;
        margin-bottom: 20px;
        font-size: 120%;
    }

    p {
        margin-top: 10px;
        margin-bottom: 10px;
    }

    .image {
        width: 250px;
        height: 280px;
        background-color: white;
    }

    img {
        width: 230px;
        height: 230px;
        margin-top: 10px;
        margin-left: 10px;
        margin-right: 10px;
        background-color: black;
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