/**
 * Created by SerkanDiz on 14.02.2014.
 */

var context;
var queue;
var WIDTH = 1024;
var HEIGHT = 768;
var stage;
var sky;
var ground;
var score = 0;
var scoreText;
var timerText;
var gameTime = 0;
var gameTimer;
var kalp;
var kalpler = [];
var islem = false;
var text;

window.onload = function () {
    var canvas = document.getElementById('myCanvas');
    context = canvas.getContext('2d');
    context.canvas.width = WIDTH;
    context.canvas.height = HEIGHT;
    stage = new createjs.Stage("myCanvas");

    queue = new createjs.LoadQueue(false);
    queue.installPlugin(createjs.Sound);
    queue.on("complete", queueLoaded, this);
    createjs.Sound.alternateExtensions = ["ogg"];

    queue.loadManifest([
        {src: "assets/sky.png", id: "sky"},
        {src: "assets/ground.png", id: "ground"},
        {src: "assets/parallaxHill1.png", id: "hill"},
        {src: "assets/parallaxHill2.png", id: "hill2"},
        {src: "assets/runningSerkan.png", id: "grant"},
        {src: "assets/tick.mp3", id: "tick"},
        {src: "assets/heart_strip.png", id: "kalp"},
        {src: "assets/stevie.mp3", id: "stevie"}
    ]);
    queue.load();

}

function queueLoaded(event) {
    sky = new createjs.Shape();
    sky.graphics.beginBitmapFill(queue.getResult("sky")).drawRect(0, 0, WIDTH, HEIGHT);
    sky.scaleX = 2;
    sky.scaleY = 2;

    var groundImg = queue.getResult("ground");
    ground = new createjs.Shape();
    ground.graphics.beginBitmapFill(groundImg).drawRect(0, 0, WIDTH + groundImg.width, groundImg.height);
    ground.tileW = groundImg.width;
    ground.y = HEIGHT - groundImg.height;

    hill = new createjs.Bitmap(queue.getResult("hill"));
    hill.setTransform(Math.random() * WIDTH, HEIGHT - hill.image.height * 3 - groundImg.height, 3, 3);

    hill2 = new createjs.Bitmap(queue.getResult("hill2"));
    hill2.setTransform(Math.random() * WIDTH, HEIGHT - hill2.image.height * 3 - groundImg.height, 3, 3);

    var data = new createjs.SpriteSheet({
        "images": [queue.getResult("grant")],
        "frames": {"regX": 0, "height": 292, "count": 64, "regY": 0, "width": 165},
        // define two animations, run (loops, 1.5x speed) and jump (returns to run):
        "animations": {"run": [0, 25, "run", 1.5], "jump": [26, 63, "run"]}
    });

    var kalpData = new createjs.SpriteSheet({
        "images": [queue.getResult("kalp")],
        "frames": {"regX": 0, "height": 64, "count": 7, "regY": 0, "width": 64},
        "animations": {"normal": [0, 6, "normal", 1.5]}
    });

    grant = new createjs.Sprite(data, "run");
    grant.setTransform(-200, 460, 0.8, 0.8);
    grant.framerate = 30;

    kalp = new createjs.Sprite(kalpData, "normal");
    kalp.setTransform(WIDTH, 440, 0.7, 0.7);
    kalp.framerate = 20;
    stage.addChild(sky, ground, hill, hill2, kalp);

    stage.addEventListener("stagemousedown", handleJumpStart);

    stage.addChild(grant);

    scoreText = new createjs.Text("YS: " + score.toString(), "36px Arial", "#FFF");
    scoreText.x = 10;
    scoreText.y = 10;
    stage.addChild(scoreText);

    text = new createjs.Text("Bu oyun Yeliz Taşlıca KOCAMAN'a olan AŞKLA yazılmıştır.", "bold 36px Arial", "#ff7700");
    text.x = 10;
    text.y = 50;
    stage.addChild(text);
    setTimeout(function () {
        text.text = "Zıplamak için Mouse'a tıklayın. Hedef 26 YS dir. Süre 200sn.";
        text.x = 5;
        setTimeout(function () {
            text.visible = false;
        }, 4000);
    }, 7000);

    //Ad Timer
    timerText = new createjs.Text("Zaman: " + gameTime.toString(), "36px Arial", "#FFF");
    timerText.x = 800;
    timerText.y = 10;
    stage.addChild(timerText);


    stage.update();

    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.addEventListener("tick", tick);

    gameTimer = setInterval(updateTime, 1000);

}

function handleJumpStart() {
    grant.gotoAndPlay("jump");
    if (kalp.visible) {
        if (grant.x >= (kalp.x - 270) && grant.x <= (kalp.x + 80)) {
            score = score + 2;
            scoreText.text = "YS: " + score.toString();
            setTimeout(function () {
                if (score == 26) {
                    islem = true;
                    text.visible = false;
                    var text2 = new createjs.Text("Sevgililer Günün Kutlu Olsun Aşkım", "bold 48px Arial", "#fa344c");
                    text2.x = 50;
                    text2.y = 150;
                    stage.addChild(text2);
                    createjs.Sound.play("stevie");
                    stage.update();
                }
                else kalp.visible = false;
            }, 500);
        }
    }
}

function tick(event) {
    if (!islem) {
        var deltaS = event.delta / 1000;
        var position = grant.x + 150 * deltaS;
        ground.x = (ground.x - deltaS * 200) % ground.tileW;

        var grantW = grant.getBounds().width * grant.scaleX;
        var kalpW = kalp.getBounds().width * kalp.scaleX;
        if (position >= WIDTH) {
            kalp.x = WIDTH;
            kalp.visible = true;
        }
        grant.x = (position >= WIDTH) ? -grantW : position;

        kalp.x = kalp.x - deltaS * 135;

        hill.x = (hill.x - deltaS * 30);
        if (hill.x + hill.image.width * hill.scaleX <= 0) {
            hill.x = WIDTH;
        }
        hill2.x = (hill2.x - deltaS * 45);
        if (hill2.x + hill2.image.width * hill2.scaleX <= 0) {
            hill2.x = WIDTH;
        }

        stage.update(event);
    }
}

function updateTime() {
    if (!islem) {
        gameTime += 1;
        if (gameTime>200) {
            islem=true;
            text.visible = true;
            text.text = "Oyun bitti. Tekrar deneyin.";
            stage.update(text);
        }
        timerText.text = "Zaman: " + gameTime;
        createjs.Sound.play("tick");
    }
}