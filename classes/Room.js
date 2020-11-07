const { v4: uuidv4 } = require('uuid');
module.exports = function Room(name){
	let room = this;
	room.name = name;
	room.id = uuidv4();
	room.pipeline = null;
	room.userCount = 0;
	room.createPipeline = (kurentoClient) => {
		return new Promise(function (resolve, reject) {
			kurentoClient.create('MediaPipeline', function(error, pipeline) {
				if (error) {
					reject(error);
				}else{
					room.pipeline = pipeline;
					resolve(pipeline);
				}
			});
		})
	}
	room.increaseCounter = () => {
		room.userCount++;
		console.log(`Room ${room.name} has ${room.userCount} participants`);
	}
	room.decreaseCounter = () => {
		if(room.userCount > 0){
			room.userCount--;
			console.log(`Room ${room.name} has ${room.userCount} participants`);
		}
	}
}