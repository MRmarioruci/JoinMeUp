import React, { Component } from 'react'
import logo from './images/logo.svg';
import './App.css';
import Forms from './components/Forms';
import Main from './components/Main';
import Footer from './components/Footer';
import {Dropdown, DropdownButton} from 'react-bootstrap';
class App extends Component {
	constructor(props) {
		super(props)

		this.state = {
			username: '',
			user_id: '',
			theme: localStorage.getItem('theme') ? localStorage.getItem('theme') : 'white'
		}
		this.checkIfLoggedIn = this.checkIfLoggedIn.bind(this)
		this.logout = this.logout.bind(this)
		this.renderOptions = this.renderOptions.bind(this)
		this.renderStyling = this.renderStyling.bind(this)
		this.setTheme = this.setTheme.bind(this)
		this.updateAppState = this.updateAppState.bind(this)
	}
	checkIfLoggedIn = async () => {
		let o = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username: this.state.username, user_id: this.state.user_id })
		};
		const response = await fetch('/isLoggedIn', o);
		const {status,data} = await response.json();
		if(status === 'ok'){
			if(data){
				this.updateAppState(data.username,data.user_id);
			}else{
				this.updateAppState('','');
			}
		}
	}
	updateAppState = (username,user_id) => {
		this.setState({
			username : username,
			user_id : user_id
		})
	}
	logout = async () => {
		let o = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({})
		};
		const response = await fetch('/logout', o);
		const {status,data} = await response.json();
		if(status == 'ok'){
			if(data){
				this.updateAppState(data.username,data.user_id);
			}
		}else{
			console.log(data);
			if(data == 'not logged'){
				this.checkIfLoggedIn();
			}else{
				this.checkIfLoggedIn();
			}
		}
	}
	renderOptions = () => {
		let themeButton = '';
		if (this.state.theme == 'white') {
			themeButton = (
				<Dropdown.Item onClick={ () => this.setTheme('dark')}>
					<i className="fa fa-palette"></i> Dark theme
				</Dropdown.Item>
			);
		} else {
			themeButton = (
				<Dropdown.Item onClick={ () => this.setTheme('white')}>
					<i className="fa fa-palette"></i> White theme
				</Dropdown.Item>
			);
		}
		let logout = (
			<Dropdown.Item onClick={this.logout}>
				<i className="fa fa-sign-out"></i> Logout
			</Dropdown.Item>
		);
		return(
			<Dropdown className="header__actions">
				<DropdownButton key="left" title={<i className="fas fa-bars"></i>} variant="light" id="dropdown-basic">
					{ this.state.username ? logout : '' }
					{ themeButton }
				</DropdownButton>
			</Dropdown>
		)
	}
	renderStyling(){
		let background = "";
		let color = "";
		switch (this.state.theme) {
			case 'white':
				background = "#fff";
				color = "";
				break;
			case 'dark':
				background = "#212224";
				color = "#fff";
				break;
			default:
				break;
		}
		return({
			background:background,
			color:color
		})
	}
	setTheme(newTheme){
		this.setState({
			theme:newTheme
		}, () => {
			localStorage.setItem('theme',newTheme)
		})
	}
	componentDidMount(){
		this.checkIfLoggedIn();
	}
	render() {
		const computedScreen = this.state.username ? <Main user_id={this.state.user_id} /> : <Forms username={this.state.username} checkIfLoggedIn={this.checkIfLoggedIn} updateAppState={this.updateAppState} theme={this.state.theme} />;
		const options = this.renderOptions();
		const styling = this.renderStyling();
		return (
			<div className="App" style={ styling }>
				<header className="header">
					<a className="logo__contain" href="/">
						<img src={logo} className="logo" alt="logo" />
						<span className="logo__text">onOne</span>
					</a>
					{ options }
				</header>
				<div>
					{ computedScreen }
				</div>
				<Footer></Footer>
			</div>
		)
	}
}

export default App