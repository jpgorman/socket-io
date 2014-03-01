

// create controller
var myCanvasContoller = injector.resolve(['canvas'], function() {
	
	var args = Array.prototype.slice.call(arguments, 0);
	
	var base = this;
		base.gameCanvas = null;

	 // create new canvas
	var myCanvas = myCanvas || new base.canvas();
	base.gameCanvas = base.gameCanvas || myCanvas.createCanvas({
		id:'canvas1',
		width:800,
		height:800
	});
	
	base.getRandomColor = function() {
		var letters = '0123456789ABCDEF'.split('');
		var color = '#';
		for (var i = 0; i < 6; i++ ) {
			color += letters[Math.round(Math.random() * 15)];
		}
		return color;
	}
	// generate random number between range
	base.getRandomInt = function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	// generate random respawn x,y
	base.reSpawn = function(ctx){
		
		var x = base.getRandomInt(0, ctx.canvas.width);
		var y = base.getRandomInt(0, ctx.canvas.height);
		
		return {
			x:x,
			y:y
		}
	}

	base.clearCanvas = function(){
		myCanvas.clearCanvas(base.gameCanvas.ctx);
	} 

	base.drawItem = function(player){
		
		
		var position = {};
		
		// position and draw new item
		if(typeof player.x === 'undefined' && typeof player.y === 'undefined'){
			
			// gnerate new position for player if one doesn't exist
			var newPosition = base.reSpawn(base.gameCanvas.ctx);
			position.x = newPosition.x;
			position.y = newPosition.y;
			position.colour = base.getRandomColor();

			player.x = position.x;
			player.y = position.y;
			player.colour = position.colour;
		}

		// now draw the position of the player
		myCanvas.drawTriangle(base.gameCanvas.ctx, {
			fillStyle : player.colour,
			coord:{
				x:player.x, 
				y:player.y
			},
			width:50,
			height:50,
			animate : true,
			directionFactorY : 1,
			animationFunction :function(delta){
				var base = this;
				return function(){
					//console.log(base.coord.y);
					if(base.coord.y < 100){
						base.directionFactorY = Math.abs(base.directionFactorY) * 1;	
					}else if(base.coord.y > 500){
						base.directionFactorY = Math.abs(base.directionFactorY) * -1
					}		
					// console.log(base.directionFactorY);
					
					dy = Math.abs(delta) * base.directionFactorY;
					
					console.log(base.coord.y);
					console.log(dy);
					
					base.coord.y+=dy;
					console.log(base.coord.y);
				}();
			}
		});
		

		// return the position of the player
		return player;
	}

	// myCanvas.loadGame(base.gameCanvas.ctx);

	return {
		drawItem : base.drawItem,
		clearCanvas : base.clearCanvas
	}
});