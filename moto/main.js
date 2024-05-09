window.addEventListener('load', function(){
    // canvas setup
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1000;
    canvas.height = 500;

    class InputHandler {
        constructor(game){
            this.game = game;
            window.addEventListener('keydown', e => {
                if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && this.game.keys.indexOf(e.key) === -1){
                    this.game.keys.push(e.key);
              
                } else if (e.key === 'd'){
                    this.game.debug = !this.game.debug;
                }
            });
            window.addEventListener('keyup', e =>{
                if (this.game.keys.indexOf(e.key) > -1){
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
                }
            });
        }
    }

    class Particle {
        constructor(game, x, y){
            this.game = game;
            this.x = x;
            this.y = y;
            this.image = document.getElementById('gears');
        }
    }

    class Player {
        constructor(game){
            this.game = game;
            this.width = 90;
            this.height = 100; 
            this.x = 20;
            this.y = 250;
            this.speedY = 0;
            this.maxSpeed = 10;
            this.minY = 0; // Posición mínima en el eje Y
            this.maxY = game.height - this.height; // Posición máxima en el eje Y (toma en cuenta el tamaño del jugador y el canvas)
            this.image = document.getElementById('player');
        }   
        update(){
            if (this.game.keys.includes('ArrowUp') || this.game.upButtonPressed) {
                this.speedY = -this.maxSpeed;
            } else if (this.game.keys.includes('ArrowDown') || this.game.downButtonPressed) {
                this.speedY = this.maxSpeed;
            } else {
                this.speedY = 0;
            }
    
            // Actualiza la posición del jugador en función de su velocidad
            this.y += this.speedY;
    
            // Verifica si el jugador ha alcanzado los límites verticales
            if (this.y < this.minY) {
                this.y = this.minY; // Si el jugador está por encima del límite superior, lo ajusta a la posición mínima
            } else if (this.y > this.maxY) {
                this.y = this.maxY; // Si el jugador está por debajo del límite inferior, lo ajusta a la posición máxima
            }
        }
        
        draw(context){
            if (this.game.debug) {
                context.strokeRect(this.x, this.y, this.width, this.height);
            }
            context.drawImage(this.image, this.x, this.y);
        }
    }
    

    class Enemy {
        constructor(game){
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random() * -2 - 5;
            this.markedForDeletion = false;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 60;
            this.minY = 0; 
            this.maxY = game.height - this.height; 
            this.scoreValue = 5; 
         
        }
        update(){
            this.x += this.speedX - this.game.speed;
            // Verifica si el enemigo ha alcanzado los límites verticales
            if (this.y < this.minY) {
                this.y = this.minY; // Si el enemigo está por encima del límite superior, lo ajusta a la posición mínima
            } else if (this.y > this.maxY) {
                this.y = this.maxY; // Si el enemigo está por debajo del límite inferior, lo ajusta a la posición máxima
            }
            if (this.x + this.width < 0) this.markedForDeletion = true;
        }
    
        draw(context){
            if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
            if (this.game.debug){
                context.font = '20px Helvetica';
                context.fillText(this.lives, this.x, this.y);
            }
        }
        
    }

    class Rival1 extends Enemy {
        constructor(game){
            super(game);
            this.width = 90;
            this.height = 100;
            this.y = Math.random() * (this.game.height * 0.9- this.height) + this.game.height * 0.1;
        this.image = document.getElementById('rival1');

        }
    }

    class Rival2 extends Enemy {
        constructor(game){
            super(game);
            this.width = 76;
            this.height = 105;
            this.y = Math.random() * (this.game.height * 0.5 - this.height * 0);
        this.image = document.getElementById('rival2');

        }
    }

    class Layer {
        constructor(game, image, speedModifier){
            this.game = game;
            this.image = image;
            this.speedModifier = speedModifier;
            this.width = 1768;
            this.height = 500;
            this.x = 0;
            this.y = 0;
        }
        update(){
            if (this.x <= -this.width) this.x = 0;
            this.x -= this.game.speed * this.speedModifier;
        }
        draw(context){
            context.drawImage(this.image, this.x, this.y);
            context.drawImage(this.image, this.x + this.width, this.y);
        }
    }

    class Background {
       constructor(game){
        this.game = game;
            this.image1 = document.getElementById('layer1');
            this.image2 = document.getElementById('layer2');
            this.image3 = document.getElementById('layer3');
            this.image4 = document.getElementById('layer4');
            this.layer1 = new Layer(this.game, this.image1,1);
            this.layer2 = new Layer(this.game, this.image2, 1);
            this.layer3 = new Layer(this.game, this.image3, 1);
            this.layer4 = new Layer(this.game, this.image4, 1);
            this.layers = [this.layer1, this.layer2, this.layer3, this.layer4];
       }
       update(){
        this.layers.forEach(layer => layer.update());
    }
    draw(context){
        this.layers.forEach(layer => layer.draw(context));
    }
    }

    class Explosion {
        constructor(game, x, y){
            this.game = game;
            this.frameX = 0;
            this.spriteWidth = 200;
            this.spriteHeight = 200;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.x = x - this.width * 0.5;
            this.y = y - this.height * 0.5;
            this.fps = 30;
            this.timer = 0;
            this.interval = 1000/this.fps;
            this.markedForDeletion = false;
            this.maxFrame = 8;
        }
        update(deltaTime){
            this.x -= this.game.speed;
            if (this.timer > this.interval){
                this.frameX++;
                this.timer = 0;
            } else {
                this.timer += deltaTime;
            }
            if (this.frameX > this.maxFrame) this.markedForDeletion = true;
        }
        draw(context){
            context.drawImage(this.image, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        }
    }
    
    class SmokeExplosion extends Explosion {
        constructor(game, x, y){
            super(game, x, y);
            this.image = document.getElementById('smokeExplosion');
        }
    }

    class FireExplosion extends Explosion {
        constructor(game, x, y){
            super(game, x, y);
            this.image = document.getElementById('fireExplosion');
        }
    }

    class UI {
        constructor(game){
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = 'Bangers';
            this.color = 'white';
        }
        draw(context){
            context.save();
            context.fillStyle = this.color;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = 'black';
            context.font = this.fontSize + 'px ' + this.fontFamily;
            //score
            context.fillText('Puntos : ' + this.game.score, 20, 40);
            // timer
            const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
            context.fillText('Tiempo : ' + formattedTime, 20, 80);
            //game over
            if (this.game.gameOver){
                context.textAlign = 'center';
                let message1;
                let message2;
                if (this.game.score >= this.game.winningScore){
                    message1 = '¡Has ganado!';
                    message2 = '¡Buen trabajo!';
                } else {
                    message1 = '¡Has perdido!';
                    message2 = '¿Vas a rendirte?';
                }
                context.font = '70px ' + this.fontFamily;
                context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 20);
                context.font = '25px ' + this.fontFamily;
                context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 20);
            
                
            context.restore();
            }
        }
    }

    class Game {
        constructor(width, height){
            this.width = width; 
            this.height = height;
            this.background = new Background(this)
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this)
            this.keys = [];
            this.explosions = [];
            this.enemies = [];
            this.enemyTimer = 0;
            this.enemyInterval = 1100;
            this.gameOver = false;
            this.score = 0;
            this.winningScore = 350;
            this.gameTime = 0;
            this.timeLimit = 90000;
            this.speed = 2;
            this.speedIncreaseInterval = 10000; // Intervalo de 10 segundos
            this.speedIncreaseAmount = 1.2; // Cantidad de aumento de velocidad
            this.speedIncreaseTimer = 0; 
            this.debug = false;
            this.upButtonPressed = false; 
            this.downButtonPressed = false; 
            this.showResetButton = false;
            
        }
        update(deltaTime){
            if (this.gameOver) return;
            if (!this.gameOver) this.gameTime += deltaTime;
            if (this.gameTime > this.timeLimit) this.gameOver = true;
            // Actualizar el contador de tiempo para el aumento de velocidad
            this.speedIncreaseTimer += deltaTime;
            // Verificar si ha pasado el intervalo para aumentar la velocidad
            if (this.speedIncreaseTimer > this.speedIncreaseInterval) {
                this.speed += this.speedIncreaseAmount;
                this.speedIncreaseTimer = 0; // Reiniciar el contador de tiempo para el siguiente intervalo
            }
            this.background.update();       
            this.player.update();
            this.explosions.forEach(explosion => explosion.update(deltaTime));
            this.explosions = this.explosions.filter(explosion => !explosion.markedForDeletion);
            this.enemies.forEach(enemy => {
                enemy.update();
                if (this.checkCollision(this.player, enemy)){
                    enemy.markedForDeletion = true;
                    this.addExplosion(enemy);
                } else if (enemy.x + enemy.width < this.player.x && !enemy.passedPlayer) {
                    // Si el enemigo ha pasado al jugador y no ha sido contabilizado aún
                    enemy.passedPlayer = true; // Marca el enemigo como pasado para evitar sumar puntos múltiples veces
                    this.score += enemy.scoreValue; // Incrementa la puntuación según el valor del enemigo
                    if (this.score >= this.winningScore) {
                        this.gameOver = true; // Establece gameOver en true si se alcanza la puntuación ganadora
                    }
                }
            });

           if (this.gameTime > this.timeLimit) {
                this.gameOver = true;
                this.endGame(); 
              }
            
              if (this.score >= this.winningScore) {
                this.gameOver = true;
                this.endGame(); 
              }
              

            
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
            if (this.enemyTimer > this.enemyInterval && !this.gameOver){
                this.addEnemy();
                this.enemyTimer = 0;
            } else { 
                this.enemyTimer += deltaTime;
            } 
        }

        draw(context){
            this.background.draw(context);
            this.player.draw(context); // Dibuja al jugador
            this.ui.draw(context); // Dibuja la interfaz de usuario
            this.enemies.forEach(enemy => {
                enemy.draw(context); // Dibuja a cada enemigo
            });
            this.explosions.forEach(explosion => {
                explosion.draw(context); // Dibuja cada explosión
            });
            if (this.showResetButton){
                const resetDiv = document.getElementById('reset');
                resetDiv.style.display = 'block';
            }
        }

        endGame() {
            this.showResetButton = true;
            const resetButton = document.getElementById('reset');
            resetButton.style.display = 'block'; 
          }
        addEnemy(){
            const randomize = Math.random();
            if( randomize < 0.5 ) this.enemies.push (new Rival1(this));
            else this.enemies.push( new Rival2(this));
            
        }
        addExplosion(enemy){
            const randomize = Math.random();
            if (randomize < 0.5) {
                this.explosions.push(new SmokeExplosion(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
            } else {
                this.explosions.push(new FireExplosion(this, enemy.x + enemy.width * 0.4, enemy.y + enemy.height * 0.2));
            }
        }
        checkCollision(rect1, rect2){
            return (        rect1.x < rect2.x + rect2.width &&
                            rect1.x + rect1.width > rect2.x &&
                            rect1.y < rect2.y + rect2.height &&
                            rect1.height + rect1.y > rect2.y)
        }
    }
    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;
    // animation loop
    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        requestAnimationFrame(animate);
    }

    // Event listener para el botón de flecha arriba
    document.getElementById("upButton").addEventListener("mousedown", function() {
        game.upButtonPressed = true;
    });

    // Event listener para el botón de flecha abajo
    document.getElementById("downButton").addEventListener("mousedown", function() {
        game.downButtonPressed = true;
    });

    // Event listener para el botón de flecha arriba (liberar)
    document.getElementById("upButton").addEventListener("mouseup", function() {
        game.upButtonPressed = false;
    });

    // Event listener para el botón de flecha abajo (liberar)
    document.getElementById("downButton").addEventListener("mouseup", function() {
        game.downButtonPressed = false;
    });
    


    // Event listener para el botón de flecha arriba
    document.getElementById("upButton").addEventListener("touchstart", function() {
        game.upButtonPressed = true;
    });

    document.getElementById("upButton").addEventListener("touchend", function() {
        game.upButtonPressed = false;
    });

    // Event listener para el botón de flecha abajo
    document.getElementById("downButton").addEventListener("touchstart", function() {
        game.downButtonPressed = true;
    });

    document.getElementById("downButton").addEventListener("touchend", function() {
        game.downButtonPressed = false;
    });

    document.getElementById("reset").addEventListener("click", function() {
        // Restablecer el juego a su estado inicial
        game.gameOver = false;
        game.score = 0;
        game.gameTime = 0;
        game.speed = 3;
        game.enemies = [];
        game.explosions = [];
        game.showResetButton = false;
    
        // Ocultar el botón de reset
        const resetDiv = document.getElementById('reset');
        resetDiv.style.display = 'none';
    });
    
    animate(0);
    
    
});
