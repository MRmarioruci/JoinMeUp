const { v4: uuidv4 } = require('uuid');
module.exports = function Router(app, Registry){
	let router = this;
	app.post('/isLoggedIn',(req,res) => {
		let o = {'status':'ok','data':false};
		let {session} = req;
		if(session.username && session.user_id){
			const user = Registry.getUser(session.user_id);
			if(!user){
				Registry.addUser({'username':req.session.username,'user_id':req.session.user_id});
			}
			o.data = {'username':req.session.username,'user_id':req.session.user_id};
		}
		res.json(o);
	});
	app.post('/login',(req,res) => {
		let {session} = req;
		if(session.username && session.user_id) {
			Registry.addUser({'username': session.username, 'user_id': session.user_id});
			return res.json({'status':'err','data':'logged'});
		}
		const exists = Registry.getUserByUserName(req.body.username);
		let o = {'status': 'err', 'data': false};
		if(!exists){
			session.username = req.body.username;
			session.user_id = uuidv4();
			const user = Registry.addUser({'username': session.username, 'user_id': session.user_id});
			if(user){
				o.status = 'ok';
				o.data = { 'username':session.username,'user_id':session.user_id };
			}else{
				o.data = 'exists';
			}
		}else{
			o.data = 'exists';
		}
		res.json(o);
	});
	app.post('/logout',(req,res) => {
		if(!req.session.username && !res.session.user_id) return res.json({'status':'err','data':'not logged'});
		let {session} = req;
		const user = Registry.getUser(session.user_id);
		let o = {'status':'ok', 'data': null};
		if(user){
			//user.disconnect();
			Registry.deleteUser(session.user_id);
			session.username = '';
			session.user_id = '';
			o.status = 'ok';
			o.data = { 'username':session.username,'user_id':session.user_id };
		}
		console.log(o);
		res.json(o);
	});
	app.post('/roomExists',(req,res) => {
		if(!req.session.username && !res.session.user_id) return res.json({'status':'err','data':'not logged'});
		const exists = Registry.getRoom(req.body.roomName);
		let o = {};
		if(!exists){
			o.status = 'ok';
			o.data = true;
		}else{
			o.status = 'err';
			o.data = 'exists';
		}
		res.json(o);
	});
}