const User = require('./User');
const Room = require('./Room');

module.exports = function Registry(){
	const userRegistry = {};
	const roomRegistry = {};
	this.addUser = (data) => {
		if(userRegistry[data.user_id] === undefined){
			userRegistry[data.user_id] = new User(data);
		}else{
			//console.log('user exists');
		}
	}
	this.getUser = (user_id) => {
		if(userRegistry[user_id]){
			return userRegistry[user_id];
		}else{
			return null;
		}
	}
	this.deleteUser = (user_id) => {
		if(userRegistry[user_id]){
			delete userRegistry[user_id];
		}else{
			console.log('user does not exist');
		}
	}
	this.addRoom = async (kurentoClient,room) => {
		if(!roomRegistry[room]){
			const new_room = new Room(room);
			roomRegistry[room] =  new_room;
			const pipeline = await new_room.createPipeline(kurentoClient);
			return new_room;
		}
	}
	this.getRoom = (room) => {
		if( roomRegistry[room] ){
			return roomRegistry[room];
		}else{
			return null;
		}
	}

}