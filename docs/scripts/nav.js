function scrollToNavItem() {
	let path = window.location.href
		.split('/')
		.pop()
		.replace(/\.html/, '');
	document.querySelectorAll('nav a').forEach(link => {
		let href = link.attributes.href.value.replace(/\.html/, '');
		if (path === href) link.scrollIntoView({ block: 'center' });
	});
}

scrollToNavItem();
