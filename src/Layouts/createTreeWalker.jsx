export default function createTreeWalker(rootNode, textToHighlight, highlightClassName, onMouseEnter, onMouseLeave) {
	const treeWalker = document.createTreeWalker(
		rootNode,
		NodeFilter.SHOW_TEXT,
		{
			acceptNode: (node) =>
				node.nodeValue.includes(textToHighlight) && !node.parentNode.classList.contains(highlightClassName)
					? NodeFilter.FILTER_ACCEPT
					: NodeFilter.FILTER_REJECT,
		},
		false,
	);

	let node;
	while ((node = treeWalker.nextNode())) {
		const text = node.nodeValue;
		const index = text.indexOf(textToHighlight);

		if (index >= 0) {
			const beforeText = text.substring(0, index);
			const highlightedText = text.substring(index, index + textToHighlight.length);
			const afterText = text.substring(index + textToHighlight.length);

			const span = document.createElement('span');
			span.className = highlightClassName;
			span.textContent = highlightedText;
			span.addEventListener('mouseenter', onMouseEnter, true); // useCapture set to true
			span.addEventListener('mouseleave', onMouseLeave, true);

			const { parentNode } = node;
			parentNode.replaceChild(document.createTextNode(beforeText), node);
			parentNode.insertBefore(span, node.nextSibling);
			parentNode.insertBefore(document.createTextNode(afterText), span.nextSibling);
		}
	}
}
