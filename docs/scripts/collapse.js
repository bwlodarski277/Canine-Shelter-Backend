function hideAllButCurrent() {
	//by default all submenut items are hidden
	//but we need to rehide them for search
	document.querySelectorAll('nav > ul > li > ul li').forEach(parent => {
		parent.style.display = 'none';
	});

	//only current page (if it exists) should be opened
	let file = window.location.pathname
		.split('/')
		.pop()
		.replace(/\.html/, '');
	document.querySelectorAll('nav > ul > li > a').forEach(parent => {
		let href = parent.attributes.href.value.replace(/\.html/, '');
		if (file === href)
			parent.parentNode.querySelectorAll('ul li').forEach(elem => {
				elem.style.display = 'block';
			});
	});
}

hideAllButCurrent();
