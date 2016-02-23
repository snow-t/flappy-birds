//建立游戏
var game = new Phaser.Game(320,505,Phaser.AUTO,'game');

//创建状态
game.States = {};

//启动状态
game.States.boot = function(){
	this.preload =function(){
		//移动设备适应
		if(!game.device.desktop){
			//设置游戏界面大小为全屏(phaser.js L18442)
			this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
			//设置为纵向界面
			this.scale.forcePortrait = true;
			//刷新比例尺?
			this.scale.refresh();
		}
		game.load.image('loading','assets/preloader.gif');//加载资源
	};

	this.create = function(){
		//在初始化完成后进入preload状态
		game.state.start('preload');	
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
		bird.animations.play('fly',12,true);
		//设置组的位置
		titleGroup.x = 35;
		titleGroup.y = 100;
		//to(properties, duration, ease, autoStart, delay, repeat, yoyo)
		//tween(对象)用于形成补间动画
		//在这里就是让他上下移动 properties 是动画效果 这里大概是将y移到120px位置
		//ease表示缓动函数 不会设置= =
		//yoyo为true表示自动反转 就是上下移动 如果false 就只向下移动
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
		this.bg = game.add.tileSprite(0,0,game.width,game.height,'background');
		//管道组
		this.pipeGroup = game.add.group();
		//开启管道的物理系统
		this.pipeGroup.enableBody = true;
		//添加地板、鸟、鸟的动画、
		this.ground = game.add.tileSprite(0,game.height-112,game.width,112,'ground');
		this.bird = game.add.sprite(50,150,'bird');
		this.bird.animations.add('fly');
		this.bird.animations.play('fly',12,true);
		//设置鸟的锚点
		this.bird.anchor.setTo(0.5, 0.5); 
		//开启鸟的物理系统
		game.physics.enable(this.bird,Phaser.Physics.ARCADE);
		//在游戏未开始时设置重力为0不让他下落
		this.bird.body.gravity.y = 0;
		//地板的物理系统
		game.physics.enable(this.ground,Phaser.Physics.ARCADE);
		//同上 游戏未开始使地板固定
		this.ground.body.immovable = true;

		//设置音效资源
		this.soundFly = game.add.sound('fly_sound');
		this.soundScore = game.add.sound('score_sound');
		this.soundHitPipe = game.add.sound('hit_pipe_sound');
		this.soundHitGround = game.add.sound('hit_ground_sound');
		//设置当前得分版
		//bitmapText: function (x, y, font, text, size)
		this.scoreText = game.add.bitmapText(game.world.centerX-20, 30, 'flappy_font', '0', 36);

		//添加 get ready文字和提示以及设置他们的锚点
		this.readyText = game.add.image(game.width/2, 40, 'ready_text');
		this.playTip = game.add.image(game.width/2,300,'play_tip');
		this.readyText.anchor.setTo(0.5, 0);
		this.playTip.anchor.setTo(0.5, 0);

		//设置参数来检验是否开始游戏
		this.hasStarted = false;
		//设置时钟事件来产生管道
		//loop(delay, callback, callbackContext, arguments);
		//callback是指运行的函数 callbackContext是指运行完callback函数后再回到这个函数?
		game.time.events.loop(900, this.generatePipes, this);
		//游戏未开始 将时钟事件设置为不开始
		game.time.events.stop(false);
		//点击屏幕后正式开始游戏(运行startGame函数)
		//addOnce表示只执行一次   *.add则是绑定 即每按一次就执行一次
		game.input.onDown.addOnce(this.statrGame, this);
	}

	this.statrGame = function(){
		//设置游戏速度,gameover参数,碰撞参数和改变游戏开始参数
		this.gameSpeed = 200;
		this.gameIsOver = false;
		this.hasHitGround = false;
		this.hasStarted = true;
		//设置初始分数
		this.score = 0;
		//令背景和地板动起来
		this.bg.autoScroll (-(this.gameSpeed/10),0);
		this.ground.autoScroll(-this.gameSpeed,0);
		//设置鸟的重力
		this.bird.body.gravity.y = 1150;
		//把提示和准备删掉
		this.readyText.destroy();
		this.playTip.destroy();
		//设置鼠标按下的反应
		game.input.onDown.add(this.fly,this);
		//启动制造管道的时钟事件
		game.time.events.start();
	}

	this.stopGame = function(){
		//取消背景和地板的自动滚动
		this.bg.stopScroll();
		this.ground.stopScroll();
		//将仍然存在的管道静止
		this.pipeGroup.forEachExists(function(pipe){
			pipe.body.velocity.x = 0;
		}, this);
		//停止小鸟的飞行动画 取消鼠标点击事件 和产生管道的时钟事件
		this.bird.animations.stop('fly', 0);
		game.input.onDown.remove(this.fly,this);
		game.time.events.stop(true);
	}

	this.fly = function(){
		//给鸟一个向上的速度
		this.bird.body.velocity.y = -350;
		//改变向上飞的时候小鸟的头的方向
		game.add.tween(this.bird).to({angle:-30},100,null,true,0,0,false);
		//播放飞翔的音效
		this.soundFly.play();
	}
	
	//碰撞管道函数
	this.hitPipe = function(){
		//这个是防止重复运行
		if(this.gameIsOver) return;
		this.soundHitPipe.play();
		this.gameOver();
	}
	this.hitGround = function(){
		if(this.hasHitGround) return;
		this.hasHitGround = true;
		this.soundHitGround.play();
		//后面的true是用来触发下面的条件来运行显示最终得分函数
		this.gameOver(true);
	}
	this.gameOver = function(show_text){
		this.gameIsOver = true;
		this.stopGame();
		if(show_text) this.showGameOverText();
	};

	this.showGameOverText = function(){
		//把当前得分重置
		this.scoreText.destroy();
		game.bestScore = game.bestScore || 0;
		//比出最好分数
		if(this.score > game.bestScore) game.bestScore = this.score;
		//创建显示得分的组,添加各种要素
		this.gameOverGroup = game.add.group();
		var gameOverText = this.gameOverGroup.create(game.width/2,0,'game_over');
		var scoreboard = this.gameOverGroup.create(game.width/2,70,'score_board');
		var currentScoreText = game.add.bitmapText(game.width/2 + 60, 105, 'flappy_font', this.score+'', 20, this.gameOverGroup); //当前分数
		var bestScoreText = game.add.bitmapText(game.width/2 + 60, 153, 'flappy_font', game.bestScore+'', 20, this.gameOverGroup); //最好分数
		//button: function (x, y, key, callback, callbackContext, overFrame, outFrame, downFrame, upFrame, group) 
		var replayBtn = game.add.button(game.width/2, 210, 'btn', function(){
			game.state.start('play');
		}, this, null, null, null, null, this.gameOverGroup);

		//设置各元素锚点
		gameOverText.anchor.setTo(0.5, 0);
		scoreboard.anchor.setTo(0.5, 0);
		replayBtn.anchor.setTo(0.5, 0);
		this.gameOverGroup.y = 30;
	}

	this.generatePipes = function(gap){
		//gap是空隙 但是我看不懂为什么要这样设置 = =
		gap = gap || 100;
		//设置管道随机位置(position位置为上方管道左下角)
		var position = (505 - 320 - gap) + Math.floor((505 - 112 - 30 - gap - 505 + 320 + gap) * Math.random());
		//上下方管道位置
		var topPipeY = position-360; 
		var bottomPipeY = position+gap;
		//将超出边界的管道重置掉
		//当函数不为0 就是进行过重置的时候就用return终止这个函数 不继续进行下面添加管道的操作 从而节省内存
		if(this.resetPipe(topPipeY,bottomPipeY)) return;

		//添加管道
		var topPipe = game.add.sprite(game.width, topPipeY, 'pipe', 0, this.pipeGroup);
		var bottomPipe = game.add.sprite(game.width, bottomPipeY, 'pipe', 1, this.pipeGroup);
		//这个setAll应该是改变内置参数?
		this.pipeGroup.setAll('checkWorldBounds',true); 
		this.pipeGroup.setAll('outOfBoundsKill',true);
		this.pipeGroup.setAll('body.velocity.x', -this.gameSpeed);
	}

	this.resetPipe = function(topPipeY,bottomPipeY){
		var i = 0;
		//Phaser.Group.prototype.forEachDead = function (callback, callbackContext) 
		//@param {function} callback - The function that will be called. Each child of the Group will be passed to it as its first parameter.
		//大概就是对pipeGroup中的每个被kill掉的对象运行函数function(pipe),然后回调本身,然后返回数据i==2
		this.pipeGroup.forEachDead(function(pipe){
			//上方管道
			if (pipe.y <= 0){
				//reset(x,y,health)就是将已经被kill掉的对象重置到(x,y)处
				pipe.reset(game.width,topPipeY);
				//将得分情况重置
				pipe.hasScored = false;
			}else{//下方管道
				pipe.reset(game.width,bottomPipeY);
			}
			pipe.body.velocity.x = -this.gameSpeed;
			i++;
		},this);
		//这个return应该是传个参数回去 令上面的判断条件成立?
		return i == 2;
	}

	this.update = function(){
		if (!this.hasStarted) return;
		game.physics.arcade.collide(this.bird,this.ground,this.hitGround,null,this);
		game.physics.arcade.overlap(this.bird,this.pipeGroup,this.hitPipe,null,this);
		if (this.bird.y < 0) this.hitPipe();
		if (this.bird.angle <90) this.bird.angle += 2.5;
		this.pipeGroup.forEachExists(this.checkScore,this);
	}

	this.checkScore = function(pipe){
		//判断条件为:处于未得分状态,只对上方管道进行检测(如缺少则过1个管道+2分),小鸟完全通过管道,
		if (!pipe.hasScored && pipe.y <= 0 && pipe.x <= this.bird.x - 17 - 54){
			pipe.hasScored = true;
			//改变得分版得分
			this.scoreText.text = ++this.score;
			//得分音效
			this.soundScore.play();
			return true;
		}
		return false;
	}
}

//将状态加入到游戏中（等于声明？）
game.state.add('boot',game.States.boot);
game.state.add('preload',game.States.preload);
game.state.add('menu',game.States.menu);
game.state.add('play',game.States.play);

//设置开始的状态
game.state.start('boot');