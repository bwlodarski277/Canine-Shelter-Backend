/* global document */
(function () {
	let targets = document.querySelectorAll('pre');
	let main = document.querySelector('#main');

	let footer = document.querySelector('#footer');
	let pageTitle = document.querySelector('#page-title');
	let pageTitleHeight = 0;

	let footerHeight = footer.getBoundingClientRect().height;

	if (pageTitle) {
		pageTitleHeight = pageTitle.getBoundingClientRect().height;

		// Adding margin (Outer height)
		pageTitleHeight += 45;
	}

	// subtracted 20 for extra padding.
	// eslint-disable-next-line no-undef
	let divMaxHeight = window.innerHeight - pageTitleHeight - footerHeight - 80;

	setTimeout(() => {
		targets.forEach(item => {
			let innerHTML = item.innerHTML;
			let divElement = document.createElement('div');

			divElement.style.maxHeight = `${divMaxHeight}px`;
			divElement.style.marginTop = '2rem';
			divElement.innerHTML = innerHTML;
			// item.removeChild();
			item.innerHTML = '';
			item.appendChild(divElement);
		});

		// eslint-disable-next-line no-undef
		main.style.minHeight = `${window.innerHeight - footerHeight - 15}px`;

		// See if we have to move something into view
		// eslint-disable-next-line no-undef
		let location = window.location.href.split('#')[1];

		if (location && location.length > 0)
			try {
				let element = document.querySelector(
					'#'.concat(decodeURI(location))
				);

				element.scrollIntoView();
			} catch (error) {
				console.log(error);
			}
	}, 300);
})();
