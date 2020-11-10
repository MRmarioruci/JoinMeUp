const passwordHash = require('password-hash');
module.exports = {
	getUserByUserName: (username, CONNECTION) => {
		return new Promise((resolve, reject) => {
			const q = 'SELECT \
			`Users`.`id` \
			FROM `Users`\
			WHERE `Users`.`username` = ?';
			CONNECTION.query(q, [username], (err, res) => {
				if(err){
					console.log(err);
					console.log(`Could not check if ${username} exists.`);
					reject('err');
				}else{
					if(res.length > 0){
						resolve(res[0].id);
					}else{
						resolve(false);
					}
				}
			})
		})
	},
	checkPassword: (username, password, CONNECTION) => {
		return new Promise((resolve, reject) => {
			const q = 'SELECT \
			`Users`.`id`, \
			`Users`.`password` \
			FROM `Users`\
			WHERE `Users`.`username` = ?';
			CONNECTION.query(q, [username], (err, res) => {
				if(err){
					console.log(`Could not check if ${username} password is correct.`);
					reject('err');
				}else{
					if(res.length > 0){
						let hashed = res[0].password;
						if(passwordHash.verify(password, hashed)){
							resolve(true);
						}else{
							resolve(false);
						}
					}else{
						resolve(false);
					}
				}
			})
		})
	},
	addUser: (username, password, CONNECTION) => {
		return new Promise((resolve, reject) => {
			const q = 'INSERT INTO `Users`(`username`,`password`,`registrationDate`) VALUES(?,?,NOW())';
			CONNECTION.query(q, [ username, passwordHash.generate(password) ], (err, res) => {
				if(err){
					console.log(`Could not add ${username} in db`, err);
					reject('err');
				}else{
					console.log(`${username} added in db`)
					resolve(true);
				}
			})
		})
	},
	addUserToRoom: (room_id, user_id, CONNECTION) => {
		return new Promise((resolve, reject) => {
			const q = 'INSERT INTO `User_Joined_Room`(`room_id`, `user_id`, `joinTime`) VALUES(?, ?, NOW()) ON DUPLICATE KEY UPDATE `joinTime` = NOW()';
			console.log(room_id, user_id);
			CONNECTION.query(q, [room_id, user_id ], (err, res) => {
				if(err){
					reject(`Could not add user ${user_id} to room ${room_id} in db`);
				}else{
					console.log(`User ${user_id} added to room ${room_id} in db`)
					resolve(true);
				}
			})
		})
	},
	getHistory: (user_id, CONNECTION) => {
		return new Promise((resolve, reject) => {
			const q = 'SELECT \
			`Rooms`.`id` AS `room_id`, \
			`Rooms`.`name`, \
			`Users`.`id`\
			FROM `User_Joined_Room`\
			JOIN `Rooms` ON `User_Joined_Room`.`room_id` = `Rooms`.`id`\
			JOIN `Users` ON `Users`.`id` = `User_Joined_Room`.`user_id`\
			WHERE `Users`.`id` = ? \
			GROUP BY `Rooms`.`id`';
			CONNECTION.query(q, [user_id], (err, res) => {
				if(err){
					console.log(`Could not get history`);
					reject('err');
				}else{
					if(res.length > 0){
						resolve(res);
					}else{
						resolve([]);
					}
				}
			})
		})
	},
	deleteHistory: (user_id, room_id, CONNECTION) => {
		return new Promise((resolve, reject) => {
			const qD = 'DELETE FROM `User_Joined_Room` WHERE `User_Joined_Room`.`room_id` = ? AND `User_Joined_Room`.`user_id` = ?';
			CONNECTION.query( qD, [room_id, user_id], (e, r) => {
				if(e){
					console.log(`Could not delete history`);
					reject(null);
				}else{
					/*Delete room if the user is the creator  */
					const qDR = 'DELETE FROM `Rooms` WHERE `Rooms`.`id` = ? AND `Rooms`.`user_id` = ?';
					CONNECTION.query( qDR, [room_id, user_id], (e, r) => {
						resolve(true);
					})
				}
			})
		})
	},
}