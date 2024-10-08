export default function createTreeWalker(rootNode, word, highlightClassName, definition) {
	const treeWalker = document.createTreeWalker(
		rootNode,
		NodeFilter.SHOW_TEXT,
		{
			acceptNode: (node) => {
				// prevent tooltip from being highlighted and cascading
				let { parentElement } = node;
				while (parentElement) {
					if (parentElement.classList.contains('tooltip')) {
						return NodeFilter.FILTER_REJECT;
					}
					parentElement = parentElement.parentElement;
				}

				// create regex to match the word
				const wordLower = word.toLowerCase();
				const regex = new RegExp(`(?:^|[\\s\\u00A0]|[-_:]|$)(${wordLower})(?:[\\s\\u00A0]|[-_:]|$)`, 'g');

				// return the node if it contains the word and is not already highlighted
				const text = node.nodeValue.toLowerCase();
				return regex.test(text) && !node.parentNode.classList.contains(highlightClassName)
					? NodeFilter.FILTER_ACCEPT
					: NodeFilter.FILTER_REJECT;
			},
		},
		false,
	);

	let node;
	while ((node = treeWalker.nextNode())) {
		const text = node.nodeValue;
		const regex = new RegExp(`(?:^|[\\s\\u00A0]|[-_:]|$)(${word})(?:[\\s\\u00A0]|[-_:]|$)`, 'gi');
		const match = text.match(regex);

		if (match) {
			const highlightedWord = match[0]; // Get the matched word with original case
			const index = text.indexOf(highlightedWord); // Get index of the matched word

			const beforeText = text.substring(0, index);
			const afterText = text.substring(index + highlightedWord.length);

			// Create a span element to wrap the matched word
			const span = document.createElement('span');
			span.className = highlightClassName;
			span.textContent = highlightedWord; // Use the matched word with original case

			const { parentNode } = node;
			parentNode.replaceChild(document.createTextNode(beforeText), node);
			parentNode.insertBefore(span, node.nextSibling);
			parentNode.insertBefore(document.createTextNode(afterText), span.nextSibling);

			let tooltip;

			span.addEventListener('mouseover', () => {
				if (!tooltip) {
					tooltip = document.createElement('div');
					tooltip.classList.add('tooltip'); // prevents tooltip from being highlighted

					tooltip.innerHTML = `
  						<div style="flex">
    						<span>${definition}</span>
    						<a href="techInDailyLife#search=${word}" class="text-blue-500 underline">Learn More</a>
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
