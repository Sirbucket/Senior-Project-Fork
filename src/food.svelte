<script>

</script>

<section class="background">
    <div class="main base">
        <div class="cuban item">
            <div class="cubanInfo info text">
                <h2>Cuban Sandwich . . . $5</h2>
                <p>Ham, provolone cheese, pickles, mayonnaise, and mustard between buttered and pressed sweet hawaiian bread
                </p>
            </div>
            <div class="img accent">
            <img src="images/cuban.jpg" alt="Cuban sandwich" class="cubanImg">
            </div>
        </div>
        <div class="hamfig item">
            <div class="hamfigInfo info text">
                <h2>Ham & Fig Sandwich . . . $5</h2>
                <p>Ham, provolone cheese, and fig jam between buttered and pressed sweet hawaiian bread
                </p>
            </div>
            <div class="img accent">
            <img src="images/ham.jpg" alt="Ham and fig sandwich" class="hamImg">
            </div>
        </div>
        <div class="grilled item">
            <div class="grilledInfo info text">
                <h2>Grilled Cheese Sandwich . . . $5</h2>
                <p>Provolone cheese between buttered and pressed sliced white bread
                </p>
            </div>
            <div class="img accent">
            <img src="images/grilled.jpg" alt="Grilled cheese" class="grilledImg">
            </div>
        </div>
        <div class="soup item">
            <div class="soupInfo info text">
                <h2>Tomato Soup . . . $5</h2>
                <p>Creamy tomato soup topped with a pinch of basil
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
        font-size: max(2vw, 12px);
    }

    p {
        font-size: max(1.5vw, 9px);
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
        height: 1.42vw;
        width: 85vw;
        border-top: 0.08vw solid;
        margin-left: auto;
        margin-right: auto;
        text-align: center;
    }
</style>