var injector = {
	/**
	 * @property {Object} dependencies object vairable into which dependancies will be stored
	 */
    dependencies: {},
    /**
	 * Register a dependency with a named index. 
	 * @method register
	 * @public
	 * @param {String} key the index into which the dependancy will be stored
	 * @param {Mixed} value this is the dependent which is being stored. Can be an object or function normally.
	 * @return {Void}
	 * @example
	 * 	mrbGeneric.injector.register('service', Service);
	 * 	mrbGeneric.injector.register('router', Router);
	 */
    register: function(key, value) {
        this.dependencies[key] = value;
    },
    /**
	 * Retrieve a dependency based on the named indicies that are passed in.
	 * Applu those dependents to the function that is passed in.
	 * change the scope of those dependents to a provided scope if needed. 
	 * @method resolve
	 * @public
	 * @param {Array} deps the list of dependents that are to be appied to the 'func' argument.
	 * @param {Function} func this is the function into which the dependents will be injected.
	 * @param {Mixed} scope this is the function/object into which the dependencies will be applied.
	 * @return {Object} returns a new object with supplied dependents and arguments as methods
	 * @example
	 * 	var doSomething = mrbGeneric.injector.resolve(['service', 'router'], function(other) {
	 *	    expect(this.service().name).to.be('Service');
	 *	    expect(this.router().name).to.be('Router');
	 *	    expect(other).to.be('Barry');
	 *	    expect().result();
	 *	});
	 *	doSomething("Barry");
	 *
	 * The above example uses the expect node package to provide light TDD
	 * Note that arguments pass into the func arguement of injector.resolve are preserved
	 * e.g. doSomething("Barry");
	 */
    resolve: function(deps, func, scope) {
        var args = [];
        scope = scope || {};
        for(var i=0; i<deps.length, d=deps[i]; i++) {
            if(this.dependencies[d]) {
                scope[d] = this.dependencies[d];
            } else {
                throw new Error('Can\'t resolve ' + d);
            }
        }
        return function() {
            return func.apply(scope || {}, Array.prototype.slice.call(arguments, 0));
        }
    }
}

var dataStore =  dataStore || (function(){

	var base = this;
	
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
	
	return {
		removeData : base.removeData,
		getData : base.getData,
		version : '1.0.1'
	}

});

var mySocketApp = mySocketApp || (function(){
	
	// localise class
	var base = this;
	
	// list dom elements
	var el = document.querySelector(".messager");
	var elBtn = document.querySelector(".button");
	var elOutput = document.querySelector(".output");
	var elClientOutput = document.querySelector(".client_output");
	
	var elConversation = $(".conversation");
	var elUsers = $(".users");

	// set socket connection
	var socket = io.connect('http://localhost:8080');
	
	// array of event handlers
	base.eventHandlers = {};

	base.setEventHandler = function(name, fn){
		
		// update eventHandlers
		if(!base.eventHandlers[name])
			base.eventHandlers[name] = fn;
		
		// chainable
		return this;
	}

	base.init = function( connectionType){
		
		var connectionCallBack = function(){
			if(connectionType === 'client'){
				// call the server-side function 'adduser' and send one parameter (value of prompt)
				socket.emit('adduser', prompt("What's your name?"));
			}
		}
		
		// on connection to server, ask for user's name with an anonymous callback
		socket.on('connect', function(){
			
			// fire connection callback
			connectionCallBack();
		});

		// listener, whenever the server emits 'updatechat', this updates the chat body
		socket.on('updategame', function (username, data) {
			
			// console.log(typeof base.eventHandlers['updategame']);
			// spawn new client data
			if(typeof base.eventHandlers['updategame'] != 'undefined'){
				base.eventHandlers['updategame'](username,data);
			}

			elConversation.append('<b>'+username + ':</b> ' + data + '<br>');
		});

		// listener, whenever the server emits 'updateusers', this updates the username list
		socket.on('updateusers', function(data) {
			$(elUsers).empty();

			$.each(data, function(key, value) {
				$(elUsers).append('<div>' + key + '</div>');
			});
		});
		

		// bind game controller events
		$('div.dpad span, div.btns span').each(function( index ) {

			$(this).off().on('click',function(){
				
				socket.emit('sendchat', $(this).data('action'));	
			});
		});

		// when the client clicks SEND
		$('.datasend').click( function() {
			var message = $('.data').val();
			$('.data').val('');
			// tell server to execute 'sendchat' and send along one parameter
			socket.emit('sendchat', message);
		});

		// when the client clicks SEND
		$('.endsession').click( function() {
			// tell server to execute 'sendchat' and send along one parameter
			socket.emit('disconnectuser');
		});

		// when the client hits ENTER on their keyboard
		$('.data').keypress(function(e) {
			if(e.which == 13) {
				$(this).blur();
				$('.datasend').focus().click();
			}
		});
	}

	return {
		//sendMessage : sendMsg
		version : '1.0.1',
		setEventHandler : base.setEventHandler,
		connect : base.init
	}

});

var myActions = myActions || (function(){
	
	var base = this;

		base.actions = {
			up : 0,
			right : 0,
			down : 0,
			left : 0,
			fire : 0
		}

	var setActions = function(input, actions){
		// use input actions or base.actions 
		actions = (typeof actions !== 'undefined')?actions:base.actions;
		
		if(typeof input !== 'undefined')
		
		// set action based on input
		if(typeof input !== 'undefined'){
			for(action in actions){
				// if input matches action then update or keep as was
				actions[action] = (input == action) ? 1 : actions[action];
			}
		}

		return actions;
	}

	return {
		setActions : setActions
	}

});


// handle DI

// register data store
// register connection handler
// register actions
// register canvas tool
injector.register('data',new dataStore());
injector.register('connection',new mySocketApp());
injector.register('actions',myActions);
injector.register('canvas', CanvasTool);


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

	base.drawItem = function(){
		
		var args = Array.prototype.slice.call(arguments, 0);
		
		var player = args[0];

		
		// position and draw new item
		if(typeof player.x === 'undefined' && typeof player.y === 'undefined'){
			
			// gnerate new position for player if one doesn't exist
			var newPosition = base.reSpawn(base.gameCanvas.ctx);
			player.x = newPosition.x;
			player.y = newPosition.y;
			player.colour = base.getRandomColor();
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

	// myCanvas.loadGame(canvas.ctx);

	return {
		drawItem : base.drawItem,
		clearCanvas : base.clearCanvas
	}
});

// create controller
var myConnectionContoller = injector.resolve(['data', 'connection', 'actions'], function() {
	
	// clients data
	var myClientsData = {};

	var args = Array.prototype.slice.call(arguments, 0);
	var connectionType = args[0];

	var base = this;

	// create entities node to store animations for each canvas			
	var data = base.data.getData(myClientsData);
		data.entities = new Array();
	
	// create singleton of canvas controller
	var canvasContoller = myCanvasContoller();

	// create event handle for new user connection
	base.connection.setEventHandler('updategame',function(username,action){
		
		if(typeof data.entities[username] === 'undefined'){
			data.entities.push(username);
			// set default actions
			data.entities[username] = new base.actions().setActions();
		}
		
		if(action === 'disconnected'){
			delete data.entities[username];
		}
		
		if(typeof data.entities[username] !== 'undefined'){

			// get current actions
			var userActions = data.entities[username];
			// get new new action
				userActions = new base.actions().setActions(action);
			// update user actions
			data.entities[username] = userActions;
		};
		
		
		// clear canvas
		canvasContoller.clearCanvas();

		//now iterate over all entries and redraw canvas
		for(username in data.entities){
			
			

			console.log(username);
			// update canvas and user actions and user position
			data.entities[username] = canvasContoller.drawItem(data.entities[username]);
		}


	});
	
	// start connection
	base.connection.connect(connectionType);

	
 });