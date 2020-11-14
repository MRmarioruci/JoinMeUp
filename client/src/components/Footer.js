import React, {useState} from 'react'
import {Modal, Button} from 'react-bootstrap';
import '../css/footer.css';
import creatorImage from '../images/coding.png';
import mainImage from '../images/4110950.png';
import logoImage from '../images/logo.png';

function Footer() {
	const [showCreditsModal, setModal ] = useState(false);
	const year = new Date().getFullYear();
	return (
		<div className="footer">
			<div className="footer__left">
				<label className="footer__label">© {year} · JoinMeUp · All rights reserved</label>
			</div>
			<div className="footer__center">
				<a href="https://github.com/MRmarioruci" target="_blank">
					<img src={creatorImage} alt="Creator" width="30" />&nbsp;
					Mario Ruci
				</a>
			</div>
			<div className="footer__right">
				<a onClick={ () => setModal(true) }>Credits</a>
			</div>
			<Modal show={showCreditsModal} onHide={ () => setModal('')} size="lg">
				<Modal.Header closeButton>
					<Modal.Title>Credits</Modal.Title>
				</Modal.Header>
				<Modal.Body className="call__start-modal">
					<div className="text-center footer__credit">
						<a href='https://www.freepik.com/vectors/people' target="_blank">
							<img src={mainImage} width="80"/>
							<br />
							People vector created by pch.vector - www.freepik.com
						</a>
					</div>
					<div className="text-center footer__credit">
						<a href='https://www.flaticon.com/' target="_blank">
							<img src={creatorImage} width="80"/>
							<br />
							Icons made by <a href="https://www.flaticon.com/free-icon/coding_711284?term=programming&page=1&position=12" title="Kiranshastry">Kiranshastry</a> from  www.flaticon.com
						</a>
					</div>
					<div className="text-center footer__credit">
						<a href='https://www.flaticon.com/' target="_blank">
							<img src={logoImage} width="80"/>
							<br />
							Icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>
						</a>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={ () => setModal('')}>
						Close
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	)
}

export default Footer
