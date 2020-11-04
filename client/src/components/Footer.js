import React, {useState} from 'react'
import {Modal, Button} from 'react-bootstrap';
import '../css/footer.css';

function Footer() {
	const [showCreditsModal, setModal ] = useState('');
	const year = new Date().getFullYear();
	return (
		<div className="footer">
			<div className="footer__left">
				<label className="footer__label">© {year} · <a href="https://github.com/MRmarioruci" target="_blank">Mario Ruci</a> · All rights reserved</label>
			</div>
			<div className="footer__right">
				<a onClick={ () => setModal(true) }>Credits</a>
			</div>
			<Modal show={showCreditsModal} onHide={ () => setModal('')} size="lg">
				<Modal.Header closeButton>
					<Modal.Title>Credits</Modal.Title>
				</Modal.Header>
				<Modal.Body className="call__start-modal">

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
