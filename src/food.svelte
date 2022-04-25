<script>

</script>

<section class="background">
    <div class="main base">
        <div class="header text">
            <h1>Sand-Wiches</h1>
        </div>
        <div class="grilled item">
            <div class="grilledInfo info text">
                <h2>Enchantingly Good Grilled Cheese. . . $3.50</h2>
                <p>Fresh pieces of mozzarella paired with provolone cheese melted in between white bread buttered & pressed in our high-grade panini press
                </p>
            </div>
            <div class="img accent">
            <img src="images/grilled.jpg" alt="Grilled cheese" class="grilledImg">
            </div>
        </div>
        <div class="sliders item">
            <div class="cubanInfo info text">
                <h2>Twin Cheesy Black Forest Sliders. . . $4.00</h2>
                <p>Fresh black forest ham and melted provolone cheese in between soft hawaiian rolls, buttered & pressed in our high-grade panini press. . . and you get two of them!
                </p>
            </div>
            <div class="img accent">
            <img src="images/cuban.jpg" alt="Cuban sandwich" class="cubanImg">
            </div>
        </div>
        <div class="cauldron item">
            <div class="hamfigInfo info text">
                <h2>Twin Cuban-Cauldron Sliders. . . $5.00</h2>
                <p>A timeless classic including fresh forest ham and melted provolone cheese topped with slices of pickle, mayonnaise, and mustard in between soft Hawaiian rolls, buttered & pressed in our high-grade panini press. . . and you get two of them!
                </p>
            </div>
            <div class="img accent">
            <img src="images/cuban.jpg" alt="Ham and fig sandwich" class="hamImg">
            </div>
        </div>
        <div class="header text">
            <h1>Soups</h1>
        </div>
        <div class="soup item">
            <div class="soupInfo info text">
                <h2>Soup-er Delicious. . . $2.00</h2>
                <p>Warm and creamy tomato soup. Highly recommend pairing with some yummy grilled cheese!
                </p>
            </div>
            <div class="img accent">
            <img src="images/soup.jpg" alt="Tomato soup" class="soupImg">
            </div>
        </div>
    </div>
    <div class="footer text base">
        <p>Kat's Contemporary Cafe | xxx-xxx-xxxx | xxx-xxx@gmail.com | 72 Tyng Rd, Tyngsboro, Massachusetts
        </p>
    </div>
</section>

<style>
    .main {
        margin: auto;
        width: 81.67vw;
        display: flex;
        flex-direction: column;
        align-items: start;
    }

    .text {
        font-size: 110%;
        font-family: 'Comfortaa', cursive;
    }

    .item {
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        width: 81.67vw;
    }

    .info {
        display: flex;
        flex-direction: column;
        width: 65%;
        margin-right: auto;
    }

    h2 {
        border-bottom: 2px solid;
        margin-right: auto;
        margin-bottom: 10px;
        font-size: max(2vw, 12px);
    }

    .header {
        font-size: max(2.4vw, 14.4px);
        align-self: center;
    }

    .header h1 {
        border-bottom: 2px solid;
    }

    p {
        font-size: max(1.5vw, 9px);
        margin-top: 10px;
    }

    .img {
        height: max(10vw, 60px);
        width: max(13.33vw, 80px);
    }

    .img img {
        width: max(12.5vw, 75px);
        height: max(7.67vw, 46px);
        margin-top: max(0.42vw, 2.5px);
        margin-left: max(0.42vw, 2.5px);
        margin-right: max(0.42vw, 2.5px);
    }

    @media screen and (max-width: 600px) {
        .item .info {
            width: 55%;
        }
        h2 {
            font-size: max(2vw, 15px);
        }
        p {
            font-size: max(1.5vw, 12px);
        }
        .img {
            height: max(10vw, 70px);
            width: max(13.33vw, 90px);
        }
        .img img {
            width: max(12.5vw, 85px);
            height: max(7.67vw, 56px);
            margin-top: max(0.42vw, 2.5px);
            margin-left: max(0.42vw, 2.5px);
            margin-right: max(0.42vw, 2.5px);
        }
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
    }
    .footer p {
        margin-top: 1.35vh;
        margin-bottom: 1.35vh;
    }
</style>