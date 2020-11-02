module.exports = {
	getUserByUserName: (username, CONNECTION) => {
		return new Promise((resolve, reject) => {
			const q = 'SELECT \
			`Users`.`id` \
			FROM `Users`\
			WHERE `Users`.`username` = ?';
			CONNECTION.query(q, [username], (err, res) => {
				if(err){
					console.log(`Could not check if ${username} exists.`);
					reject('err');
				}else{
					if(res.length > 0){
						resolve(true);
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
						resolve(true);
					}else{
						resolve(false);
					}
				}
			})
		})
	},
	addUser: (username, password, CONNECTION) => {
		return new Promise((resolve, reject) => {
			const q = 'INSERT INTO `Users`(`username`,`password`)';
			CONNECTION.query(q, [username], (err, res) => {
				if(err){
					console.log(`Could not check if ${username} password is correct.`);
					reject('err');
				}else{
					if(res.length > 0){
						resolve(true);
					}else{
						resolve(false);
					}
				}
			})
		})
	}
}