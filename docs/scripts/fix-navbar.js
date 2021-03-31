/* global document */
(function () {
	function setNavbarMainContentHeight() {
		let heading = document.querySelector('#navbar-heading');
		let searchBox = document.querySelector('#search-box');
		let sidebarMainContent = document.querySelector(
			'#sidebar-main-content'
		);

		let heightToSubtract = 32;

		if (heading) heightToSubtract += heading.getBoundingClientRect().height;

		if (searchBox)
			heightToSubtract += searchBox.getBoundingClientRect().height;

		// eslint-disable-next-line no-undef
		sidebarMainContent.style.height += `${
			window.innerHeight - heightToSubtract
		}px`;
	}

	setNavbarMainContentHeight();
	// eslint-disable-next-line no-undef
	window.addEventListener('resize', setNavbarMainContentHeight);
})();
