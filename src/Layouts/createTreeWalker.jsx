export default function createTreeWalker(rootNode, word, highlightClassName, definition) {
	const treeWalker = document.createTreeWalker(
		rootNode,
		NodeFilter.SHOW_TEXT,
		{
			acceptNode: (node) =>
				node.nodeValue.includes(word) && !node.parentNode.classList.contains(highlightClassName)
					? NodeFilter.FILTER_ACCEPT
					: NodeFilter.FILTER_REJECT,
		},
		false,
	);

	let node;
	while ((node = treeWalker.nextNode())) {
		const text = node.nodeValue;
		const index = text.indexOf(word);

		if (index >= 0) {
			const beforeText = text.substring(0, index);
			const highlightedText = text.substring(index, index + word.length);
			const afterText = text.substring(index + word.length);

			const span = document.createElement('span');
			span.className = highlightClassName;
			span.textContent = highlightedText;

			const { parentNode } = node;
			parentNode.replaceChild(document.createTextNode(beforeText), node);
			parentNode.insertBefore(span, node.nextSibling);
			parentNode.insertBefore(document.createTextNode(afterText), span.nextSibling);

			let tooltip;

			span.addEventListener('mouseover', () => {
				if (!tooltip) {
					tooltip = document.createElement('div');
					console.log(definition);

					tooltip.innerHTML = `
  						<div style="flex">
    						<span>${definition}</span>
    						<a href="glossary#${word}" class="text-blue-500 underline">Learn More</a>
  						</div>
					`;

					tooltip.style.position = 'absolute';
					tooltip.style.backgroundColor = 'white';
					tooltip.style.padding = '5px';
					tooltip.style.border = '1px solid gray';
					tooltip.style.borderRadius = '3px';

					// Get the position of the span
					const spanRect = span.getBoundingClientRect();
					// Get position of the scroll
					const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
					tooltip.style.left = `${spanRect.left}px`;
					tooltip.style.top = `${spanRect.bottom + scrollTop}px`;

					tooltip.addEventListener('mouseleave', () => {
						hideTooltipAfterDelay();
					});

					span.addEventListener('mouseleave', () => {
						hideTooltipAfterDelay();
					});
				}
				document.body.appendChild(tooltip);
				span.tooltip = tooltip;
			});

			function hideTooltipAfterDelay() {
				setTimeout(() => {
					if (span && span.tooltip && document.body.contains(span.tooltip)) {
						if (!span.matches(':hover') && !span.tooltip.matches(':hover')) {
							document.body.removeChild(span.tooltip);
							span.tooltip = null;
						}
					}
				}, 500);
			}
		}
	}
}
