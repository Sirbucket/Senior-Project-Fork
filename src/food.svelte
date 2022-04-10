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
        width: 980px;
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
        align-items: center;
        height: 149px;
    }

    .info {
        display: flex;
        flex-direction: column;
        width: 800px;
    }

    h2 {
        border-bottom: 2px solid;
        margin-right: auto;
    }

    .img {
        height: 120px;
        width: 160px;
    }

    .img img {
        width: 150px;
        height: 92px;
        margin-top: 5px;
        margin-left: 5px;
        margin-right: 5px;
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