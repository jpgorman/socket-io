

// create controller
var myConnectionContoller = injector.resolve(['data', 'connection', 'actions'], function() {
	
	// clients data
	var myClientsData = {};
	var userMultiplyer = 15;
	var args = Array.prototype.slice.call(arguments, 0);
	var connectionType = args[0];

	var base = this;

	// create entities node to store animations for each canvas			
	var data = base.data.getData(myClientsData);
		data.entities = new Array();

	// create singleton of canvas controller
	var canvasContoller = new myCanvasContoller();
	
	// inerpret the player actions
	base.interpretActions = function(){
		
		//now iterate over all entries and redraw canvas
		for(username in data.entities){
											
			// interate over actions
			for(action in data.entities[username].actions){
				

				// use currently set action to udpate user position
				if(data.entities[username].actions[action]===1){
					// unset action as it's being processed
					data.entities[username].actions[action] = 0;

					// update position based on action
					(action == 'up')?data.entities[username].position.y -= userMultiplyer : null;
					(action == 'right')?data.entities[username].position.x += userMultiplyer : null;
					(action == 'down')?data.entities[username].position.y += userMultiplyer : null;
					(action == 'left')?data.entities[username].position.x -= userMultiplyer : null;
					// (action == 'fire')?data.entities[username].position.x ++ : null;
				}
			}

		}

	}

	// redraw the canvas
	base.drawcanvas = function(){
			
		// clear canvas
		canvasContoller.clearCanvas();

		//now iterate over all entries and redraw canvas
		for(username in data.entities){
											
			// update canvas with user data
			data.entities[username].position = canvasContoller.drawItem(data.entities[username].position);
			

		}

	};

	// create new user position
	base.connection.setEventHandler('creatuserposition',function(){
		return canvasContoller.drawItem({});
	});

	// create event handle to update game state
	base.connection.setEventHandler('updategame',function(username,userData){
		
		// disconnect user
		if(userData === 'disconnected'){
			delete data.entities[username];
		}

		// add new user actions
		if(typeof data.entities[username] === 'undefined'){
			// create new user in entities
			data.entities[username] = new Array();
			// set default actions
			data.entities[username].actions = new base.actions().setActions();
			// position user on canvas
			data.entities[username].position = userData;
		}
		

		// updated existing user actions
		if(typeof data.entities[username] !== 'undefined'){

			// update user actions
			data.entities[username].actions = new base.actions().setActions(userData);
		};
		
		// update the player based on actions
		base.interpretActions();
		
		// emit update position to clients except sender
		// socket.emit('sendposition',username,data.entities[username]);
		// base.drawcanvas();

	});
	
	// start connection
	base.connection.connect(connectionType);

	
 });