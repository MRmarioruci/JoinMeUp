import React, {useEffect, useState} from 'react'
import {CopyToClipboard} from 'react-copy-to-clipboard';

function History() {
	const [rooms, setRoom] = useState([]);
	useEffect(() => {
		getHistory();
	},[])
	const getHistory = async () => {
		let o = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({})
		};
		const response = await fetch('/getHistory', o);
		const {status,data} = await response.json();
		if(status === 'ok'){
			if(data){
				setRoom([...rooms, ...data]);
			}else{
				console.log('History error');
			}
		}
	}
	return (
		<div className="history__section">
			<h3>
				<i className="fa fa-history" aria-hidden="true"></i>
				&nbsp;
				<span>History</span>
				{
					rooms.length > 0 && 
					<table className="table table-hover table-justify">
						<tbody>
							{
								rooms.map( (room, index) => {
									return (
									<tr key={index}>
										<th className="fnt17">{index+1}</th>
										<th className="fnt17 table__30">{room.name}</th>
										<th className="fnt17 table__30">{room.id}</th>
										<th className="fnt17">
											<a className="btn btn-primary" href={window.location.href+'call/'+room.name}>
												<i className="fas fa-sign-in-alt"></i>&nbsp;
												Join
											</a>
										</th>
										<th>
											<CopyToClipboard text={window.location.href+'call/'+room.name}>
												<button className="btn btn-success" title="Copy to clipboard">
													<i className="far fa-clipboard"></i>&nbsp;
													<span> Copy</span>
												</button>
											</CopyToClipboard>
										</th>
										<th className="fnt17">
											<button className="btn btn-danger">
												<i className="fas fa-trash"></i>&nbsp;
												Delete
											</button>
										</th>
									</tr>
									)
								})
							}
						</tbody>
					</table>
				}
				{
					rooms.length == 0 && 
					<div className="text-center"> No rooms joined yet.</div>
				}
			</h3>
			<hr/>
		</div>
	)
}

export default History
