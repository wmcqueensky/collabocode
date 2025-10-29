import { X } from "lucide-react";

type RegisterModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (e: React.FormEvent) => void;
	onSwitchModal: () => void;
};

const RegisterModal = ({
	isOpen,
	onClose,
	onSubmit,
	onSwitchModal,
}: RegisterModalProps) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
			<div className="bg-[#252525] rounded-lg shadow-xl w-full max-w-md">
				<div className="p-6">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-xl font-semibold text-white">Create Account</h2>
						<button
							onClick={onClose}
							className="text-gray-400 hover:text-white"
						>
							<X size={20} />
						</button>
					</div>

					<form onSubmit={onSubmit} className="space-y-4">
						<div>
							<label
								htmlFor="username"
								className="block text-sm font-medium text-gray-300 mb-1"
							>
								Username
							</label>
							<input
								type="text"
								id="username"
								className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#5bc6ca] focus:border-[#5bc6ca]"
							/>
						</div>

						<div>
							<label
								htmlFor="register-email"
								className="block text-sm font-medium text-gray-300 mb-1"
							>
								Email
							</label>
							<input
								type="email"
								id="register-email"
								className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#5bc6ca] focus:border-[#5bc6ca]"
								placeholder="your@email.com"
							/>
						</div>

						<div>
							<label
								htmlFor="register-password"
								className="block text-sm font-medium text-gray-300 mb-1"
							>
								Password
							</label>
							<input
								type="password"
								id="register-password"
								className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#5bc6ca] focus:border-[#5bc6ca]"
							/>
						</div>

						<div>
							<label
								htmlFor="confirm-password"
								className="block text-sm font-medium text-gray-300 mb-1"
							>
								Confirm Password
							</label>
							<input
								type="password"
								id="confirm-password"
								className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#5bc6ca] focus:border-[#5bc6ca]"
							/>
						</div>

						<div className="flex items-center">
							<input
								id="agree-terms"
								type="checkbox"
								className="h-4 w-4 rounded border-gray-700 text-[#5bc6ca] focus:ring-[#5bc6ca]"
							/>
							<label
								htmlFor="agree-terms"
								className="ml-2 block text-sm text-gray-300"
							>
								I agree to the{" "}
								<a href="#" className="text-[#5bc6ca]">
									Terms
								</a>{" "}
								and{" "}
								<a href="#" className="text-[#5bc6ca]">
									Privacy Policy
								</a>
							</label>
						</div>

						<button
							type="submit"
							className="w-full bg-[#5bc6ca] hover:bg-[#48aeb3] text-white py-2 px-4 rounded-md transition-colors"
						>
							Create Account
						</button>

						<div className="text-center text-sm text-gray-400">
							Already have an account?{" "}
							<button
								type="button"
								className="text-[#5bc6ca] hover:text-[#48aeb3]"
								onClick={onSwitchModal}
							>
								Sign in
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default RegisterModal;
