class Sprite {
    constructor({position, imageSrc, scale = 1, framesmax = 1, offset = {x: 0, y: 0}, sprites}){
        this.position = position
        this.width = 50
        this.height = 150
        this.image = new Image()
        this.image.src = imageSrc
        this.scale = scale
        this.framesmax = framesmax
        this.framesCurrent = 0
        this.framesElapsed = 0
        this.framesHold = 5
        this.offset = offset
        this.sprites = sprites
    }

    draw(){
        c.drawImage(
            this.image,
            this.framesCurrent * (this.image.width / this.framesmax),
            0,
            this.image.width / this.framesmax,
            this.image.height,
            
            this.position.x - this.offset.x, 
            this.position.y - this.offset.y, 
            (this.image.width / this.framesmax) * this.scale, 
            this.image.height * this.scale
        )
    }

    animateFrames(){
        this.framesElapsed ++
        if(this.framesElapsed % this.framesHold === 0){
            if(this.framesCurrent < this.framesmax - 1){
                this.framesCurrent ++
            } else {
                this.framesCurrent = 0
            }
        }
    }

    update (){
        this.draw()
        this.animateFrames()
    }
}

class Fighter extends Sprite{
    constructor({
        position,
        velocity, 
        color = 'red' ,
        imageSrc, 
        scale = 1, 
        framesmax = 1, 
        offset = {x: 0, y: 0},
        sprites,
        attackBox = {
            offset: {

            },
            width: undefined,
            height : undefined
        }
    }){
        super({
            position, imageSrc, scale, framesmax, offset
        })
        this.velocity = velocity
        this.width = 50
        this.height = 150
        this.lastKey 
        this.attackBox = {
            position : {
                x: this.position.x,
                y: this.position.y
            },

            offset : attackBox.offset,

            width: attackBox.width,
            height: attackBox.height
        }
        this.color = color
        this.isAttacking  
        this.health = 100
        this.framesCurrent = 0
        this.framesElapsed = 0
        this.framesHold = 5
        this.sprites = sprites
        this.dead = false

        for( const sprite in sprites){
            sprites[sprite].image = new Image()
            sprites[sprite].image.src = sprites[sprite].imageSrc
        }

    }


    update (){
        this.draw()
        if (!this.dead) this.animateFrames()

        //attack boxes
        this.attackBox.position.x =this.position.x + this.attackBox.offset.x
        this.attackBox.position.y =this.position.y + this.attackBox.offset.y

        //c.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height)

        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        //gravity func
        if(this.position.y  + this.height + this.velocity.y >= canvas.height - 96) {
            this.velocity.y = 0
            this.position.y = 330
        } else
         this.velocity.y += gravity

        
    }
    attack(){
        this.switchSprite('attack1')
        this.isAttacking = true
       
    }

    takeHit() {
    this.health -= 20;

    // Load the 'takeHit' image
    const hitImage = new Image();
    hitImage.src = 'kenji/Take Hit.png'; // Correct path

    hitImage.onload = () => {
        this.switchSprite('takeHit'); // Switch to the 'takeHit' sprite after the image loads
    };

    hitImage.onerror = () => {
        console.error('Failed to load hit image at', hitImage.src);
    };

    if (this.health <= 0) {
        this.switchSprite('death');
    }
}

    switchSprite(sprite){
        if (this.image === this.sprites.death.image) {
            if( this.framesCurrent === this.sprites.death.framesmax - 1)
                this.dead = true
            return}

        if(
            this.image === this.sprites.attack1.image && 
            this.framesCurrent < this.sprites.attack1.framesmax - 1
        ) 
            return

        if(
            this.image === this.sprites.takeHit.image && 
            this.framesCurrent < this.sprites.takeHit.framesmax - 1
        )
            return

        switch (sprite) {
            case 'idle':
                if(this.image !== this.sprites.idle.image){
                    this.framesmax = this.sprites.idle.framesmax
                    this.image =this.sprites.idle.image
                    this.framesCurrent = 0
                }
            break;
            case 'run':
                if(this.image !== this.sprites.run.image){
                    this.image = this.sprites.run.image
                    this.framesmax = this.sprites.run.framesmax
                    this.framesCurrent = 0
                }
                
            break;
            case 'jump':
                if(this.image!== this.sprites.jump.image){
                    this.image = this.sprites.jump.image
                    this.framesmax = this.sprites.jump.framesmax
                    this.framesCurrent = 0
                }
            break;    
            case 'fall':
                if(this.image!== this.sprites.fall.image){
                    this.image = this.sprites.fall.image
                    this.framesmax = this.sprites.fall.framesmax
                    this.framesCurrent = 0
                }
            break;
            case 'attack1':
                if(this.image!== this.sprites.attack1.image){
                    this.image = this.sprites.attack1.image
                    this.framesmax = this.sprites.attack1.framesmax
                    this.framesCurrent = 0
                }
            break;
            case 'takeHit':
                if(this.image!== this.sprites.takeHit.image){
                    this.image = this.sprites.takeHit.image
                    this.framesmax = this.sprites.takeHit.framesmax
                    this.framesCurrent = 0
                }
            break;
            case 'death':
                if(this.image!== this.sprites.death.image){
                    this.image = this.sprites.death.image
                    this.framesmax = this.sprites.death.framesmax
                    this.framesCurrent = 0
                }
            break;
        }
    }
}

