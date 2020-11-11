import React, { useState } from 'react'
import rateCallImage from '../images/rate_call.svg'
import thankImage from '../images/thank.svg'
import {Link} from 'react-router-dom';

function Rate(props) {
	const [submitted, setSubmit] = useState(false)
	const submitRating = async(value) => {
		let o = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({'room_id': props.room_id, 'value': value})
		};
		const response = await fetch('/rateCall', o);
		const {status,data} = await response.json();
		if(status === 'ok'){
			if(data){
				setSubmit(true);
			}else{
				console.log('History deletion error');
			}
		}
	}
	return (
		<div>
			{
				submitted ?
				(
				<div>
					<img className="img-responsive" src={ thankImage } alt="thank you"/>
					<h2>Thank you for choosing JoinMeUp!</h2>
				</div>
				)
				:
				(
				<div>
					<img  src={ rateCallImage } className="rate__call-img" />
					<h2>Please take a second to rate your JoinMeUp call experience.</h2>
					<div className="text-center">
						<div className="rate">
							<input type="radio" onClick={() => { submitRating(5) } } id="star5" name="rate" value="5" />
							<label htmlFor="star5" title="text">5 stars</label>
							<input type="radio" onClick={() => { submitRating(4) } } id="star4" name="rate" value="4" />
							<label htmlFor="star4" title="text">4 stars</label>
							<input type="radio" onClick={() => { submitRating(3) } } id="star3" name="rate" value="3" />
							<label htmlFor="star3" title="text">3 stars</label>
							<input type="radio" onClick={() => { submitRating(2) } } id="star2" name="rate" value="2" />
							<label htmlFor="star2" title="text">2 stars</label>
							<input type="radio" onClick={() => { submitRating(1) } } id="star1" name="rate" value="1" />
							<label htmlFor="star1" title="text">1 star</label>
						</div>
					</div>
				</div>
				)
			}
			<br />
			<div>
				<button onClick={() => { props.startSending() }} className="btn btn-primary">Enter call again</button>
				<Link to='/' className="btn btn-light">
					Go to home
				</Link>
			</div>
		</div>
	)
}

export default Rate
