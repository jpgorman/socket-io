var eventDown = ($('html.no-touch')) ? 'mousedown' : 'touchstart';
var eventUp = ($('html.no-touch')) ? 'mouseup' : 'touchend';

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


// set socket connection
var socket = io.connect('http://localhost:8080');
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
				
				// update user position array
				if(typeof base.eventHandlers['creatuserposition'] != 'undefined'){
					var data = base.eventHandlers['creatuserposition']();
				}

				socket.emit('adduser', prompt("What's your name?"), data);
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

		// listener, whenever the server emits 'updateuserlist', this updates the chat body
		socket.on('updateuserlist', function (username, data) {
			
			elConversation.append('<b>'+username + ':</b> ' + data + '<br>');
					
		});

		// listener, whenever the server emits 'updateusers', this updates the username list
		socket.on('updateusers', function(data) {
			$(elUsers).empty();

			$.each(data, function(key, value) {
				$(elUsers).append('<div>' + key + '</div>');
			});
		});
		
		// event action function
		var eventStillOn = false;
		var clickInterval = null;
		var actionEvent = function(action){
			
			if(!eventStillOn){
			//	console.log(mouseStillDown);
				clearInterval(clickInterval);
				return false;
			}
			// emit the sendchat event
			// socket.emit('sendchat', action);
			
			// if event is true then fire
			if(eventStillOn){
				
				clickInterval = setInterval(function(){
					socket.emit('sendchat', action);
				}, 50);

				return true;
			}
		}

		// bind game controller events
		$('div.dpad span, div.btns span').each(function( index ) {
			
			// some chaining
			$(this).off().on(eventDown,function(){
				
				eventStillOn = true;
				actionEvent($(this).data('action'));

			}).on(eventUp,function(){
				eventStillOn = false;
				actionEvent();
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