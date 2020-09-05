const os = require('os');
module.exports = {
	getLocalIPv4: function () {
		const ifaces = os.networkInterfaces();
		for( let ifname in ifaces){
			const f = ifaces[ifname].find(function (iface) {
				/* Ignore internal ips (i.e. 127.0.0.1) and non IPv4 addresses */
				return !!( iface.family == 'IPv4' && iface.internal === false);
			});
			if( f ) return f.address;
		}
		return null;
	}
}