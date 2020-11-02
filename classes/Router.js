const { v4: uuidv4 } = require('uuid');
const User_Model = require('../models/User_Model');

module.exports = function Router(app, Registry, CONNECTION){
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
	app.post('/checkCredentials',async (req,res) => {
		let {session} = req;
		let o = {'status': 'err', 'data': false};
		if(session.username && session.user_id) {
			Registry.addUser({'username': session.username, 'user_id': session.user_id});
			return res.json({'status':'err','data':'logged'});
		}
		const exists = await User_Model.getUserByUserName(req.body.username, CONNECTION).catch( (err) => {});
		if(!exists){
			const new_user = User_Model.addUser(req.body.username, req.body.password, CONNECTION).catch( (err) => {});
			if(new_user){
				session.username = req.body.username;
				session.user_id = new_user;
				Registry.addUser({'username': session.username, 'user_id': session.user_id});
				o.status = 'ok';
				o.data = { 'username':session.username,'user_id':session.user_id };
			}
		}else{
			const isPasswordCorrect = await User_Model.checkPassword(req.body.username, req.body.password, CONNECTION).catch( (err) => {});
			if(isPasswordCorrect){

			}
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