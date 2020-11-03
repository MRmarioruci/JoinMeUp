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
	}
}