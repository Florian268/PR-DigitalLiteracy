import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import createTreeWalker from './createTreeWalker';
import Popup from './popup';
import glossary from './glossary';

const Layout = ({ children }) => {
	const [popupData, setPopupData] = useState({ show: false, definition: '', position: { top: 0, left: 0 } });

	useEffect(() => {
		const observer = new MutationObserver(() => {
			glossary.forEach(({ word, definition }) => {
				createTreeWalker(
					document.body,
					word,
					'highlight',
					(event) => {
						// onMouseEnter callback
						setPopupData({
							show: true,
							definition,
							position: {
								top: event.clientY,
								left: event.clientX,
							},
						});
					},
					() => {
						// onMouseLeave callback
						setPopupData({ ...popupData, show: false });
					},
				);
				// child
				const contentElement = document.querySelector('.px-5.md\\:px-0 > div:nth-of-type(2)');
				if (contentElement) {
					createTreeWalker(
						contentElement,
						word,
						'highlight',
						(event) => {
							// onMouseEnter callback
							setPopupData({
								show: true,
								definition,
								position: {
									top: event.clientY,
									left: event.clientX,
								},
							});
						},
						() => {
							// onMouseLeave callback
							setPopupData({ ...popupData, show: false });
						},
					);
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
			<Popup {...popupData} />
		</>
	);
};

Layout.propTypes = {
	children: PropTypes.node.isRequired,
};

export default Layout;
