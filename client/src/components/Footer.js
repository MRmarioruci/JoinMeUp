import React from 'react'
import '../css/footer.css';

function Footer() {
	const year = new Date().getFullYear();
	return (
		<div className="footer">
			<div className="footer__left">
				<label className="footer__label">© {year} · <a href="https://github.com/MRmarioruci" target="_blank">Mario Ruci</a> · All rights reserved</label>
			</div>
			<div className="footer__right">
				<a>Credits</a>
			</div>
		</div>
	)
}

export default Footer
