    (function() {
	    var lastTime = 0;
	    var vendors = ['ms', 'moz', 'webkit', 'o'];
	    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
	        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
	        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
	                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
	    }
	 
	    if (!window.requestAnimationFrame)
	        window.requestAnimationFrame = function(callback, element) {
	            var currTime = new Date().getTime();
	            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
	            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
	              timeToCall);
	            lastTime = currTime + timeToCall;
	            return id;
	        };
	 
	    if (!window.cancelAnimationFrame)
	        window.cancelAnimationFrame = function(id) {
	            clearTimeout(id);
	        };
	        
	    
	    if (!window.arrayCompare)
	    	window.arrayCompare = function(a1, a2) {
		    if (a1.length != a2.length) return false;
		    var length = a2.length;
		    for (var i = 0; i < length; i++) {
		        if (a1[i] !== a2[i]) return false;
		    }
		    return true;
		}
		
		if (!window.inArray)
			window.inArray = function(needle, haystack){
		    var length = haystack.length;
		    for(var i = 0; i < length; i++) {
		        if(typeof haystack[i] == 'object') {
		            if(window.arrayCompare(haystack[i], needle)) return true;
		        } else {
		            if(haystack[i] == needle) return true;
		        }
		    }
		    return false;
		}
		
		
		if (!window.capitalise)
	    	window.capitalise = function(str){
				// get first instance of a string char and replaces to uppercase
				return (str + '').replace(/^(?:\s+)?([a-z])/g, function ($1) {
		       		return $1.toUpperCase();
		    	});
			}
	    
	}());
	
	var CanvasTool = CanvasTool || (function(){
		
		var base = this;
		var body = document.getElementsByTagName('body')[0];
		
		// data binding variables
		var cache = {};
		var guidCounter = 1;
		var expando = "data" + (new Date).getTime();
		
		// returns data for a given elem, retrieved from cache object
		base.getData = function (elem) {
			var guid = elem[expando];
			if (!guid) {
				// guid = value of guidCounter e.g. 1, 2, 3 etc, elem[expando]  is set e.g. timestamp 090219312, guidCounter is incremented
				// finally cache object is set for for key guid e.g. e.g. 1, 2, 3
				guid = elem[expando] = guidCounter++;
			  	cache[guid] = {};
			}
			return cache[guid];
		};
		
		// removes data from cache and expando from element
		base.removeData = function (elem) {
			var guid = elem[expando];
			
			if (!guid) return;
			
			delete cache[guid];
			try {
			  	delete elem[expando];
			}
			catch (e) {
			  	if (elem.removeAttribute) {
			    	elem.removeAttribute(expando);
			  	}
			}
		};
	
		base.createCanvas = function(options){
			
			// if canvas doesn't exist, then create lese just return existing canvas
			if(!document.getElementById(options.id)){
				var canvas = null;
				var context = null;	
				
				canvas = document.createElement('canvas');
				canvas.id = options.id;
		
				ctx = canvas.getContext('2d');
				
				canvas.width = options.width;
				canvas.height = options.height;
				
				body.appendChild(canvas);
				
				// create and animations node to store animations for each canvas			
				var data = base.getData(ctx.canvas);
					data.animates = new Array();

			}else{
				ctx = document.getElementById(options.id).getContext('2d'); 
				
				var data = base.getData(ctx.canvas);
			}

			return {ctx:ctx, id:ctx.canvas.id};
		}
		
		base.drawSquare = function(context, options){
			
			var shape = options;		
				shape.name = 'drawSquare';	
			var ctx = context;
			
			var draw = function(ctx, shape){
				ctx.fillStyle = shape.fillStyle;
				
				ctx.moveTo(shape.coord.x,shape.coord.y);
				ctx.beginPath();
				ctx.moveTo((shape.coord.x+shape.width),shape.coord.y);
				ctx.lineTo((shape.coord.x+shape.width),(shape.height+shape.coord.y));
				ctx.lineTo((shape.coord.x),(shape.height+shape.coord.y));
				ctx.lineTo(shape.coord.x,shape.coord.y);
				ctx.fill();
			}
			
			// run draw in scope of current ctx
			
			if(typeof shape.angle != 'undefined'){
				base.rotateCanvas(ctx, shape, draw);
			}else{			
				// add draw method to ctx
				base.helpers.dispatch(this, draw, [ctx, shape]);
			}
			
			// push shape into animations array for the given canvas
			if(shape.animate){
				var data = base.getData(ctx.canvas);
				data.animates.push(shape);
				shape.animate = false; // it won't get Qued again
			}
			
			return {
				draw : draw
			}
		}
		
		base.drawTriangle = function(context, options){
			
			var shape = options;	
				shape.name = 'drawTriangle';		
			var ctx = context;
			
			var draw = function(ctx, shape){
				
				// return immediate fuction
				return (function(){
					
					var current_point = {};
					
					// set file style
					ctx.fillStyle = shape.fillStyle;
				
					var current_point = {
						x:shape.coord.x,
						y:shape.coord.y
					}
					
					if(typeof shape.angle == 'undefined'){
						// centre point
						position = base.helpers.setCenter(shape);
						current_point.x = position.x;
						current_point.y = position.y;
						
						// console.log(current_point);
						ctx.moveTo(current_point.x,current_point.y);
					}
					
					ctx.beginPath();
					// top of triangle
					current_point.x ;
					current_point.y -= (shape.height/2);			
					
					// console.log(current_point);
					ctx.lineTo(current_point.x,current_point.y);
								
					
					// bottom right of triangle
					current_point.x += (shape.width/2);
					current_point.y += (shape.height);
					
					// console.log(current_point);
					ctx.lineTo(current_point.x,current_point.y);			
								
					
					// bottom left of triangle
					current_point.x -= (shape.width);
					current_point.y;
					
					// console.log(current_point);
					ctx.lineTo(current_point.x,current_point.y);		
					
					ctx.fill();
				})();
			}
							
			// run draw in scope of current ctx
			
			if(typeof shape.angle != 'undefined'){
				base.rotateCanvas(ctx, shape, draw);
			}else{			
				// add draw method to ctx
				base.helpers.dispatch(this, draw, [ctx, shape]);
			}
			if(shape.animate){
				data = base.getData(ctx.canvas);
				data.animates.push(shape);
				
				
				shape.animate = false; // it won't get Qued again
			}
			
			return {
				draw : draw
			}
		}
		
		base.drawImage =  function(context, options){
			
			var opts = options;			
			var ctx = context;
			var imageObj = new Image();
			var imageData = new Array();
			
			var current_point = {
				x:options.coord.x,
				y:options.coord.y
			}
		
			var draw = function(){	
				// return immediate fuction
				return (function(){
					
					// place image
					var drawImage1 = function () { 
						
						
						
						ctx.drawImage(imageObj,-(opts.width/2),-(opts.height/2), opts.width, opts.height);
					
						//ctx.drawImage(imageObj,current_point.x,current_point.y, opts.width, opts.height);
					};			
							
					// run draw in scope of current ctx					
					if(typeof opts.angle != 'undefined'){
						base.rotateCanvas(ctx, opts, drawImage1);
					}else{			
						// add draw method to ctx
						base.helpers.dispatch(this, drawImage1, [ctx, opts]);
					}
					
					
					// Draw it in pieces.
					// with extra arguments you take :
					
					// src image
					// src x,y 
					// src width and height
					
					// placed at
					
					// destination x,y
					// destination width, height
					
           			ctx.drawImage(imageObj, 1, 1, imageObj.width / 2, imageObj.height / 2, 50, 350, 50, 50);
           			// save image data
           			imageData.push(ctx.getImageData(1, 1, imageObj.width / 2, imageObj.height / 2));
           			
		            ctx.drawImage(imageObj, 1, imageObj.height / 2, imageObj.width / 2, imageObj.height / 2, 150, 350, 50, 50);
		            ctx.drawImage(imageObj, imageObj.width / 2, 1, imageObj.width / 2, imageObj.height / 2, 250, 350, 50, 50);
		            ctx.drawImage(imageObj, imageObj.width / 2, imageObj.height / 2, imageObj.width / 2, imageObj.height / 2, 350, 350, 50, 50);
            
					
					// draw a line around it
				    ctx.beginPath();
				 	ctx.moveTo(current_point.x,current_point.y);
				 	ctx.lineTo((current_point.x+opts.width),current_point.y);
					ctx.lineTo((current_point.x+opts.width),(opts.height+current_point.y));
					ctx.lineTo((current_point.x),(opts.height+current_point.y));
					ctx.lineTo(current_point.x,current_point.y);
					ctx.strokeStyle = opts.strokeStyle;
				    ctx.stroke();
				})();
			};
			
		
			// pass onload function the draw method
			imageObj.onload = draw;
			// now give the image a src
			imageObj.src = opts.src;
			
		}
		
		base.helpers = {
			dispatch :function(context, method, args){
				method.apply(context, args);
			},
			setCenter : function(options){
				var x = options.coord.x;
				var y = options.coord.y;
					x += (options.width/2);
					y += (options.height/2);
				return {
					x : x,
					y : y
				};
			}	
		}
		
		base.rotateCanvas = function(ctx, options, callback){
			
			// get central position
			position = base.helpers.setCenter(options);
			// console.log(position);
			// save the context's co-ordinate system before
			// we screw with it
			ctx.save();
			// move the robot center   
			ctx.translate(position.x, position.y); 
			// rotate canvas
			ctx.rotate(base.convertToRadians(options.angle));
			
			// remember that the start point is now 0,0 as we have transllated on the canvas to the center of the item
			options.coord.x=0;
			options.coord.y=0;
			// run callback e.g. thing that you want to draw
			if(callback)
				base.helpers.dispatch(this, callback, [ctx, options]);
			
			// then draw the image back and up
			// context.drawImage(frames[frame], -(robot.w/2), -(robot.w/2));
			// and restore the co-ordinate system to its default
			// top left origin with no rotation
			ctx.restore();
			
			return false;
		};
		
		// convert degrees e.g. 90 to radians
		base.convertToRadians = function (degree) {
			return degree*(Math.PI/180);
		};
		
		base.clearCanvas = function(ctx){
	
			// clear Canvas
			ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);

		}
		
		base.beginLoop = function(ctx){

			var frameId = 0;
			var lastFrame = Date.now();
			var context = ctx;
			var cnt = 0;
			
			// get canvas data
			var data = base.getData(ctx.canvas);
			
			function loop() {
	
				// wipe canvas
				base.clearCanvas(context);
	
				var thisFrame = Date.now();
	
				var delta = thisFrame - lastFrame;
				
				frameId = window.requestAnimationFrame(loop);
	
				// animate items in animates array
				for(item in data.animates){
					var animation = data.animates[item];
					// get reference to draw function
					var fn = animation.name;
					// call animationFunction of object
					animation.animationFunction(delta);
					// console.log(animation.coord.y);
					
					// envoke fn with call
					base[fn].apply(this,[context, animation]);
				}
					/*
				if(cnt==20){
					console.log('cancelled');
					//window.cancelAnimationFrame(frameId);
				}*/
				
	
				lastFrame = thisFrame;
				cnt ++;
			}
	
			loop();
	
		}
		
		base.loadGame = function (ctx){
			
			// load canvases
			// console.log(animates);
			// my
			// start animation
			base.beginLoop(ctx);
		}
			
		return {
			createCanvas : base.createCanvas,
			clearCanvas : base.clearCanvas,
			drawImage : base.drawImage,
			drawSquare : base.drawSquare,
			drawTriangle : base.drawTriangle,
			loadGame : base.loadGame,
			getData : base.getData,
			removeData : base.removeData
		}
	});