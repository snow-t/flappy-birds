/*var game = new Phaser.Game(400, 490, Phaser.AUTO, 'gameDiv');

game.State = function(){ };
game.State.prototype = {
	preload:function(){
		this.game.stage.backgroundColor = '#71C5CF';
		this.game.load.image('bird','assets/bird.png');


		this.game.load.image('pipe','assets/pipe.png');
	},

	create: function(){
		//game.physics.startSystem(Phaser.Physics.ARCADE);
		this.bird = this.game.add.sprite(100,245,'bird');
		//game.physics.arcade.enable(this.bird);
		this.bird.body.gravity.y = 1000;
		var spaceKey = this.game.input.keyboard.addKey(phaser.Keyboard.SPACEBAR);
		spaceKey.onDOwn.add(this.jump,this);

		this.pipes = game.add.group();
		//this.pipes.enableBody = true;
		this.pipes.createMultipe(20,'pipe');
		this.timer = game.time.events.loop(1500,this.addRowOfPipes, this);
	},

	update: function(){
		if (this.bird.inWorld == false){
			this.restartGame();
		}
	},

	jump: function(){
		this.bird.body.velocity.y = -350;
	},

	restartGame: function(){
		game.state.start('main');
	},

	addOnePipe: function(x,y){
		var pipe = this.pipes.getFirstDead();
		pipe.reset(x,y);
		pipe.body.velocity.x = -200;
		pipe.checkWorldBounds = true;
		pipe.outOfBoundsKill = true;
	},

	addRowOfPipes: function(){
		var hole = Math.floor(Math.random() * 5) + 1;
		for (var i = 0; i < 8; i++)
			if ( i != hole && i != hole + 1)
				this.addOnePipe(400, i * 60 + 10);
		},
}

game.state.add('main', mainState);  
game.state.start('main'); */