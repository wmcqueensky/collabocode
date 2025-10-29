import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "../../../../../../contexts/AuthContext";

type LoginModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onSwitchModal: () => void;
};

const LoginModal = ({ isOpen, onClose, onSwitchModal }: LoginModalProps) => {
	const { signIn } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		const { error: signInError } = await signIn(email, password);

		if (signInError) {
			setError(signInError.message);
			setLoading(false);
		} else {
			setEmail("");
			setPassword("");
			setLoading(false);
			onClose();
		}
	};

	const handleClose = () => {
		setEmail("");
		setPassword("");
		setError("");
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
			<div className="bg-[#252525] rounded-lg shadow-xl w-full max-w-md">
				<div className="p-6">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-xl font-semibold text-white">Sign In</h2>
						<button
							onClick={handleClose}
							className="text-gray-400 hover:text-white"
						>
							<X size={20} />
						</button>
					</div>

					{error && (
						<div className="mb-4 p-3 bg-red-500 bg-opacity-10 border border-red-500 rounded-md">
							<p className="text-sm text-red-500">{error}</p>
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-300 mb-1"
							>
								Email
							</label>
							<input
								type="email"
								id="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#5bc6ca] focus:border-[#5bc6ca]"
								placeholder="your@email.com"
							/>
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-300 mb-1"
							>
								Password
							</label>
							<input
								type="password"
								id="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#5bc6ca] focus:border-[#5bc6ca]"
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<input
									id="remember-me"
									type="checkbox"
									className="h-4 w-4 rounded border-gray-700 text-[#5bc6ca] focus:ring-[#5bc6ca]"
								/>
								<label
									htmlFor="remember-me"
									className="ml-2 block text-sm text-gray-300"
								>
									Remember me
								</label>
							</div>

							<div className="text-sm">
								<a href="#" className="text-[#5bc6ca] hover:text-[#48aeb3]">
									Forgot password?
								</a>
							</div>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-[#5bc6ca] hover:bg-[#48aeb3] text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? "Signing in..." : "Sign In"}
						</button>

						<div className="text-center text-sm text-gray-400">
							Don't have an account?{" "}
							<button
								type="button"
								className="text-[#5bc6ca] hover:text-[#48aeb3]"
								onClick={onSwitchModal}
							>
								Register now
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default LoginModal;
