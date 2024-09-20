export default function Popup({ definition, show, position }) {
	if (!show) return null;

	return (
		<div
			className="absolute bg-white border border-gray-200 p-2 rounded shadow-md"
			style={{
				top: position.top + 20,
				left: position.left,
			}}
		>
			{definition}
		</div>
	);
}
