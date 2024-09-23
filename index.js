const socket = io.connect("https://trial-fights.vercel.app/")

let music = new Audio("upbeat-126503.mp3")
let sword = new Audio("sword-sound-effect-2-full-pack-link-in-comments-234986_TilKiFc3.mp3")
let running = new Audio("running-sounds-6003.mp3")
let death = new Audio("person-knocked-down-14798.mp3")



const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.7

const background = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    imageSrc : './img/background.png'
})

const shop = new Sprite({
    position: {
        x: 600,
        y: 128
    },
    imageSrc : './img/shop.png',
    scale : 2.75,
    framesmax : 6
})


const player = new Fighter({
    position: {
    x: 0,
    y: 0
    },
    velocity : {
        x: 0,
        y: 0
    },
    offset: {
        x: 0,
        y: 0
    },
    imageSrc : './img/Idle.png',
    framesmax : 8,
    scale : 2.5,
    offset: {
        x: 205,
        y: 157
    },
    sprites : {
        idle : {
            imageSrc : './img/Idle.png',
            framesmax : 8
        },
        run : {
            imageSrc : './img/Run.png',
            framesmax : 8
        },
        jump : {
            imageSrc : './img/Jump.png',
            framesmax : 2
        },
        fall : {
            imageSrc : './img/Fall.png',
            framesmax : 2
        },
        attack1 : {
            imageSrc : './img/Attack1.png',
            framesmax : 6
        },
        takeHit : {
            imageSrc : './img/Take Hit - white silhouette.png',
            framesmax : 4
        },
        death : {
            imageSrc : './img/Death.png',
            framesmax : 6
        }
    },
    attackBox : {
        offset : {
            x : 100,
            y : 50
        },
        width : 165,
        height : 50
    }
})


const enemy = new Fighter({
    position: {
    x: 400,
    y: 100
    },
    velocity : {
        x: 0,
        y: 0
    },
    color: 'blue',
    offset: {
        x: -50,
        y: 0
    },
    imageSrc : './kenji/Idle.png',
    framesmax : 4,
    scale : 2.5,
    offset: {
        x: 205,
        y: 170
    },
    sprites : {
        idle : {
            imageSrc : './kenji/Idle.png',
            framesmax : 4
        },
        run : {
            imageSrc : './kenji/Run.png',
            framesmax : 8
        },
        jump : {
            imageSrc : './kenji/Jump.png',
            framesmax : 2
        },
        fall : {
            imageSrc : './kenji/Fall.png',
            framesmax : 2
        },
        attack1 : {
            imageSrc : './kenji/Attack1.png',
            framesmax : 4
        },
        takeHit : {
            imageSrc : './kenji/Take Hit.png',
            framesmax : 3
        },
        death : {
            imageSrc : './kenji/Death.png',
            framesmax : 7
        }
    },
    attackBox : {
        offset : {
            x : -162,
            y : 50
        },
        width : 162,
        height : 50
    }
})



console.log(player);

let playerDead = false;
let enemyDead = false;

//Synchronize player and enemy state using socket.io
socket.on('playerUpdate', (data) => {
    player.position = data.position
    player.velocity = data.velocity
    player.switchSprite(data.currentSprite)
});

socket.on('enemyUpdate', (data) => {
    enemy.position = data.position
    enemy.velocity = data.velocity
    enemy.switchSprite(data.currentSprite)
});
socket.on('playerAttackUpdate', (data) => {
    player.isAttacking = data.isAttacking;
    player.framesCurrent = data.framesCurrent; // Sync current attack frame
});

socket.on('enemyAttackUpdate', (data) => {
    enemy.isAttacking = data.isAttacking;
    enemy.framesCurrent = data.framesCurrent; // Sync current attack frame
});
socket.on('playerAttack', (data) => {
    if (data.playerId === 'player') {
        // Trigger player attack animation
        player.attack();
    } else if (data.playerId === 'enemy') {
        // Trigger enemy attack animation
        enemy.attack();
    }
});



//Listen for timer updates NITYA ADDED
const timerDisplay=document.querySelector('#timer');
socket.on('timerUpdate', (timeLeft) => {
    timerDisplay.textContent = timeLeft;  // Update timer display
});
socket.on('gameOver', (message) => {
    alert(message);  // Display game over message
    // Optionally, handle resetting or ending the game here
});

socket.on('chatMessage', ({ username: sender, message }) => {
    const messageElement = document.createElement('p');

    // Style the message differently based on the sender
    if (sender === username) {
        messageElement.classList.add('my-message');
    } else {
        messageElement.classList.add('other-message');
    }

    messageElement.textContent = `${sender}: ${message}`;
    messages.appendChild(messageElement);
    messages.scrollTop = messages.scrollHeight;  // Auto scroll to the bottom
});
//NITYA ADDITION DONE

//  NITYA ADDING CHATBOX
const username = prompt("Enter your name");
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');
const messages = document.getElementById('messages');

sendButton.addEventListener('click', () => {
    const message = chatInput.value;
    if (message) {
        // Emit the message to the server
        socket.emit('chatMessage', { username, message });
        chatInput.value = '';
    }
});

const keys = {
    a: {
        pressed : false
    },
    d: {
        pressed : false
    },
    ArrowRight: {
        pressed : false
    },
    ArrowLeft: {
        pressed: false
    }
}



decreaseTimer()

//Start BGM
document.addEventListener('click', () => {
    music.loop = true; // Loop the music
    music.volume = 0.3; // Set volume
    music.play().catch(error => {
        console.log("Audio playback failed: ", error);
    });
});

function animate(){
    window.requestAnimationFrame(animate)
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)
    background.update()
    shop.update()
    c.fillStyle = 'rgba(255, 255, 255, 0.2)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.update()
    enemy.update()

    player.velocity.x = 0
    enemy.velocity.x = 0

    //Running sound
    let isRunningSoundPlaying = false;

    //player movement
    
    if(keys.a.pressed && player.lastKey === 'a'){
        player.velocity.x = -5
        player.switchSprite('run')
        if (!isRunningSoundPlaying) {
            running.play();
            isRunningSoundPlaying = true;
        }
    } else if (keys.d.pressed && player.lastKey === 'd'){
        player.velocity.x = 5
        player.switchSprite('run')
        if (!isRunningSoundPlaying) {
            running.play();
            isRunningSoundPlaying = true;
        }
    } else {
        player.switchSprite('idle')
        running.pause();
        isRunningSoundPlaying = false;
    }

    //jumping
    if(player.velocity.y < 0){
        player.switchSprite('jump')
    } else if (player.velocity.y > 0) {
        player.switchSprite('fall')
    }

    //enemy movement
    if(keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft'){
        enemy.velocity.x = -5
        enemy.switchSprite('run')
        if (!isRunningSoundPlaying) {
            running.play();
            isRunningSoundPlaying = true;
        }
    } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight'){
        enemy.velocity.x = 5
        enemy.switchSprite('run')
        if (!isRunningSoundPlaying) {
            running.play();
            isRunningSoundPlaying = true;
        }
    } else {
        enemy.switchSprite('idle')
        running.pause();
        isRunningSoundPlaying = false;
    }


    //jumping
    if(enemy.velocity.y < 0){
        enemy.switchSprite('jump')
    } else if (enemy.velocity.y > 0) {
        enemy.switchSprite('fall')
    }


    //detect collision & enemy gets hit

    if(
        rectCollision({
            rect1: player,
            rect2: enemy
        }) && 
        player.isAttacking && player.framesCurrent === 4
    )   {
        enemy.takeHit()
        player.isAttacking = false
        sword.play();
        
        gsap.to('#enemyHealth', {
            width : enemy.health + '%'
        })
    }

    //if player misses
    if (player.isAttacking && player.framesCurrent ===4){
        player.isAttacking = false
    }


    //Player gets hit
    if(
        rectCollision({
            rect1: enemy,
            rect2: player
        }) && 
        enemy.isAttacking && enemy.framesCurrent === 2
    )   {
        player.takeHit()
        enemy.isAttacking = false
        sword.play();

        gsap.to('#playerHealth', {
            width : player.health + '%'
        })
        
    }

    //if enemy misses
    if (enemy.isAttacking && enemy.framesCurrent === 2){
        enemy.isAttacking = false
    }


    //end game based on health
    if (enemy.health <= 0 && !enemyDead) {
        enemyDead = true; 
        death.play(); // Play death sound
        determineWinner({ player, enemy, timerId });
    }

    if (player.health <= 0 && !playerDead) {
        playerDead = true; 
        death.play(); // Play death sound
        determineWinner({ player, enemy, timerId });
    }

    /*nitya added*/
    socket.emit('playerState', {
        position : player.position,
        velocity : player.velocity,
        currentSprite : player.sprites
    })
    
    socket.emit('enemyState', {
        position : enemy.position,
        velocity : enemy.velocity,
        currentSprite : enemy.sprites
    })
    /* nitya addition done*/
}



animate()
// ADDED BY NITYA
function playerAttack() {
    socket.emit('playerAttack', {
        isAttacking: player.isAttacking,
        framesCurrent: player.framesCurrent // or the specific frame you want to sync
    });
}

function enemyAttack() {
    socket.emit('enemyAttack', {
        isAttacking: enemy.isAttacking,
        framesCurrent: enemy.framesCurrent
    });
}
// NITYA ADDITION DONE

window.addEventListener('keydown', (event) => {
    if(!player.dead){

        switch(event.key){
            case 'd':
                keys.d.pressed = true
                player.lastKey = 'd'
                break 
            case 'a':
                keys.a.pressed = true
                player.lastKey = 'a'
                break 
            case 'w':
                player.velocity.y = -20
                break    
            case ' ' :
                player.attack();
                sword.play();
                //ADDED BY NITYA
                socket.emit('playerAttack', {
                    playerId: 'player',
                    attackType: 'attack1'
                });
                break    
        
        }
    }    
    if(!enemy.dead){
        switch (event.key) {
            case 'ArrowRight':
                keys.ArrowRight.pressed = true
                enemy.lastKey = 'ArrowRight'
                break 
            case 'ArrowLeft':
                keys.ArrowLeft.pressed = true
                enemy.lastKey = 'ArrowLeft'
                break 
            case 'ArrowUp':
                enemy.velocity.y = -20
                break
        }
    }
})

window.addEventListener('keyup', (event) => {
    switch(event.key){
        case 'd':
            keys.d.pressed = false
            break  
        case 'a':
            keys.a.pressed = false
            break  
        case 'w':
        keys.a.pressed = false
        lastKey = 'w'
        break  
        
        case 'ArrowRight':
            keys.ArrowRight.pressed = false
            enemy.lastKey = 'ArrowRight'
            break 
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false
            enemy.lastKey = 'ArrowLeft'
            break 
        case 'ArrowDown':
            enemy.attack();
            sword.play();
            //ADDED BY NITYA
            socket.emit('playerAttack', {
                playerId: 'enemy',
                attackType: 'attack1'
            });
            break
    }
})
