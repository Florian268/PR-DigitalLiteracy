import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import createTreeWalker from './createTreeWalker';
import glossary from './glossary';

const Layout = ({ children }) => {
	useEffect(() => {
		const observer = new MutationObserver(() => {
			glossary.forEach(({ word, definition }) => {
				createTreeWalker(document.body, word, 'highlight', definition);
				// child
				const contentElement = document.querySelector('.px-5.md\\:px-0 > div:nth-of-type(2)');
				if (contentElement) {
					createTreeWalker(contentElement, word, 'highlight', definition);
				}
			});
		});

		observer.observe(document.body, { childList: true, subtree: true });

		return () => observer.disconnect();
	}, []);

	return (
		<>
			<div className="px-5 md:px-0">
				<Navbar />
				<div>{children}</div>
			</div>
			<Footer />
		</>
	);
};

Layout.propTypes = {
	children: PropTypes.node.isRequired,
};

export default Layout;
