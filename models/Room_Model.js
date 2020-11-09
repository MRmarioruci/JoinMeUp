module.exports = {
	addRoom: (name, user_id, CONNECTION) => {
		return new Promise((resolve, reject) => {
			const qS = 'SELECT `Rooms`.`id` FROM `Rooms` WHERE `Rooms`.`name` = ?';
			CONNECTION.query(qS, [name], (err, res) => {
				if(err){
					reject(false);
				}else{
					if(res.length){
						resolve(res[0].id);
					}else{
						const q = 'INSERT INTO `Rooms`(`name`, `user_id`, `creationTime`) VALUES(?, ?, NOW())';
						CONNECTION.query(q, [name, user_id ], (err, res) => {
							if(err){
								console.log(`Could not add room ${name} in db`);
								reject('err');
							}else{
								console.log(`Room ${name} added in db`)
								resolve(res.insertId);
							}
						})
					}
				}
			})
		})
	},
}