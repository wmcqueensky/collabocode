import { Link } from "react-router-dom";

const Footer = () => {
	return (
		<footer className="bg-[#2c2c2c] border-t border-gray-700 py-8 mt-16">
			<div className="max-w-6xl mx-auto px-4 text-center">
				<div className="flex justify-center space-x-4 mb-4">
					<Link to="/" className="text-gray-400 hover:text-[#5bc6ca]">
						Home
					</Link>
					<Link to="#" className="text-gray-400 hover:text-[#5bc6ca]">
						About
					</Link>
					<Link to="#" className="text-gray-400 hover:text-[#5bc6ca]">
						Contact
					</Link>
					<Link to="#" className="text-gray-400 hover:text-[#5bc6ca]">
						FAQ
					</Link>
				</div>
				<p className="text-gray-500 text-sm">
					&copy; {new Date().getFullYear()} CollaboCode. All rights reserved.
				</p>
			</div>
		</footer>
	);
};

export default Footer;
