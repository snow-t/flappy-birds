//建立游戏
var game = new Phaser.Game(320,505,Phaser.AUTO,'game');

//创建状态？
game.States = {};

//启动状态
game.States.boot = function(){
	this.preload =function(){
		game.load.image('loading','assets/preloader.gif');//加载资源
	};

	this.create = function(){
		game.state.start('preload');	//在初始化完成后进入preload状态
	};
}

//加载状态
game.States.preload = function(){
	this.preload = function (){
		var preloadSprite = game.add.sprite(35,game.height/2,'loading');
		game.load.setPreloadSprite(preloadSprite);	//显示进度条

		//加载资源
		//spritesheet(key, url, frameWidth, frameHeight, frameMax, margin, spacing)
		game.load.image('background','assets/background.png'); //游戏背景图
		game.load.image('ground','assets/ground.png'); //地面
		game.load.image('title','assets/title.png'); //游戏标题
		game.load.spritesheet('bird','assets/bird.png',34,24,3); //鸟
		game.load.image('btn','assets/start-button.png');  //按钮
		game.load.spritesheet('pipe','assets/pipes.png',54,320,2); //管道
		game.load.bitmapFont('flappy_font', 'assets/fonts/flappyfont/flappyfont.png', 'assets/fonts/flappyfont/flappyfont.fnt');//显示分数的字体
		game.load.audio('fly_sound', 'assets/flap.wav');//飞翔的音效
		game.load.audio('score_sound', 'assets/score.wav');//得分的音效
		game.load.audio('hit_pipe_sound', 'assets/pipe-hit.wav'); //撞击管道的音效
		game.load.audio('hit_ground_sound', 'assets/ouch.wav'); //撞击地面的音效

		game.load.image('ready_text','assets/get-ready.png'); //get ready图片
		game.load.image('play_tip','assets/instructions.png'); //玩法提示图片
		game.load.image('game_over','assets/gameover.png'); //gameover图片
		game.load.image('score_board','assets/scoreboard.png'); //得分板
	}

	this.create = function(){
		game.state.start('menu');
	}
}

//菜单状态
game.States.menu = function(){
	this.create = function (){
		//声明地板和背景 tileSprite大概跟上面的Sprite差不多 不过不用给他多个动作状态 
		//它会自动平铺来达到滚动的效果
		//后面参数目测为(初始位置x,初始位置y,宽度,高度,key)
		game.add.tileSprite(0,0,game.width,game.height,'background').autoScroll(-10,0);
		game.add.tileSprite(0,game.height - 112,game.width,112,'ground').autoScroll(-100,0);

		//创建放标题的组
		var titleGroup = game.add.group();
		//添加title
		titleGroup.create(0,0,'title');
		//添加bird
		var bird = titleGroup.create(190,10,'bird');
		//给鸟添加动画
		//add(name, frames, frameRate, loop, useNumericIndex) 
		bird.animations.add('fly');
		//播放鸟的动画
		//play(name, frameRate, loop, killOnComplete)
		bird.animations.play('fly',90,true);
		//设置组的位置
		titleGroup.x = 35;
		titleGroup.y = 100;
		//to(properties, duration, ease, autoStart, delay, repeat, yoyo)
		//tween(对象)用于形成补间动画
		//在这里就是让他上下移动 properties 是动画效果 这里大概是将y移到120px位置
		//ease表示缓动函数 不会设置= =
		//yoyo为true表示自动反转 就是上下移动 如果flase 就只向下移动
		game.add.tween(titleGroup).to({y : 120},1000,null,true,0,Number.MAX_VALUE,true);
		//设置开始按钮
		var btn = game.add.button(game.width/2,game.height/2,'btn',function(){
			game.state.start('play');
		});

		btn.anchor.setTo(0.5,0.5);
	}
}

//正式游戏状态
game.States.play = function(){
	this.create = function(){
		this.bg = game.add.titleSprite(0,0,game.width,game.height,'background');
		this.pipeGroup = game.add.group();
		this.pipeGroup.enableBody = true;
		this.ground = game.add.tileSprite(0,game.height-112,game.width,112,'ground');
		this.bird = game.add.sprite(50,150,'bird');
		this.bird.animations.add('fly');
		this.bird.animations.play('fly',12,true);
		this.bird.anchor.setTo(0.5, 0.5); 
		game.physics.enable(this.bird,Phaser.Physics.ARCADE);
		this.bird.body.gravity.y = 0;
		game.physics.enable(this.ground,Phaser.Physics.ARCADE);
		this.ground.body.immovable = true;

		this.readyText = game.add.image(game.width/2, 40, 'ready_text');
		this.playTip = game.add.image(game.width/2,300,'play_tip');
		this.readyText.anchor.setTo(0.5, 0);
		this.playTip.anchor.setTo(0.5, 0);

		this.hasStarted = false;
		game.time.events.loop(900, this.generatePipes, this);
		game.time.events.stop(false);
		game.input.onDown.addOnce(this.statrGame, this);
	}
}

//将状态加入到游戏中（等于声明？）
game.state.add('boot',game.States.boot);
game.state.add('preload',game.States.preload);
game.state.add('menu',game.States.menu);
game.state.add('play',game.States.play);

//设置开始的状态
game.state.start('boot');