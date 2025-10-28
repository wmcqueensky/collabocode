const Footer = () => {
	return (
		<footer className="bg-[#2c2c2c] border-t border-gray-700 py-8 mt-16">
			<div className="max-w-6xl mx-auto px-4 text-center">
				<p className="text-gray-500 text-sm">
					&copy; {new Date().getFullYear()} CollaboCode. All rights reserved.
				</p>
			</div>
		</footer>
	);
};

export default Footer;
