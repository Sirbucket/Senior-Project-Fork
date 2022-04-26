<script>

</script>

<section class="background">
    <div class="main">
        <div class="stickers">
            <img class="light" src="images/stickerLight.png" alt="cool sticker">
            <img class="dark" src="images/stickerDark.png" alt="cool sticker">
            <img class="catgirl" src="images/stickerCatgirl.png" alt="cool sticker">
        </div>
        <div class="link text base">
            <h3>You can buy these wonderful stickers and so much more at the link below!</h3>
            <a class="pink" href="https://www.etsy.com/shop/NatWDesigns?ref=seller-platform-mcnav" target="_blank"><b>Nat W's Etsy Shop</b></a>
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
        flex-direction: column;
        justify-content: space-evenly;
        align-items: center;
    }

    .text {
        font-family: 'Comfortaa', cursive;
    }

    .stickers {
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        width: 100%;
    }

    img {
        height: 25vw;
        width: 25vw;
    }

    .link {
        font-size: max(2vw, 13.8px);
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        text-align: center;
    }

    .link h3 {
        border-bottom: 2px solid;
        margin-bottom: 0px;
    }

    .pink {
        margin-top: 10px;
        text-decoration: none;
        transition: .5s;
    }

    .pink:hover {
        transform: scale(1.1, 1.1);
    }


    .footer {
        height: 5.4vh;
        width: 85vw;
        border-top: 0.08vw solid;
        margin-left: auto;
        margin-right: auto;
        margin-bottom: 0px;
        margin-top: 20px;
        text-align: center;
        font-size: 110%;
    }
    .footer p {
        margin-top: 1.35vh;
        margin-bottom: 1.35vh;
    }
</style>