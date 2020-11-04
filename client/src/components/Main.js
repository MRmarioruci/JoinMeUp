import React, { Component } from 'react'
import '../css/main.css';
import {Modal, Button} from 'react-bootstrap';
import UserPage from './UserPage';
import CallPage from './CallPage';
import {Route, BrowserRouter as Router, Switch} from 'react-router-dom';

function Main(props){
	return (
		<Router>
			<Switch>
				<Route path="/" exact render={(routeProps) => (
    				<UserPage {...routeProps} {...props} />)}
				/>
				<Route path="/call/:id" render={(routeProps) => (
    				<CallPage {...routeProps} {...props} />)}
				/>
			</Switch>
		</Router>
	)
}
export default Main
