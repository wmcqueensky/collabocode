import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { useAuth } from "../../../../../../contexts/AuthContext";

type RegisterModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onSwitchModal: () => void;
};

const RegisterModal = ({
	isOpen,
	onClose,
	onSwitchModal,
}: RegisterModalProps) => {
	const { signUp } = useAuth();
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [agreedToTerms, setAgreedToTerms] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const [loading, setLoading] = useState(false);
	const modalRef = useRef<HTMLDivElement>(null);

	// Handle outside click
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				modalRef.current &&
				!modalRef.current.contains(event.target as Node)
			) {
				handleClose();
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen]);

	// Handle escape key
	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				handleClose();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
		};
	}, [isOpen]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess(false);

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		if (!agreedToTerms) {
			setError("Please agree to the Terms and Privacy Policy");
			return;
		}

		if (password.length < 6) {
			setError("Password must be at least 6 characters long");
			return;
		}

		if (!username.trim()) {
			setError("Username is required");
			return;
		}

		setLoading(true);

		const { error: signUpError } = await signUp(email, password, username);

		if (signUpError) {
			setError(signUpError.message);
			setLoading(false);
		} else {
			setSuccess(true);
			setUsername("");
			setEmail("");
			setPassword("");
			setConfirmPassword("");
			setAgreedToTerms(false);
			setLoading(false);

			// Close modal after showing success message briefly
			setTimeout(() => {
				onClose();
				setSuccess(false);
			}, 3000);
		}
	};

	const handleClose = () => {
		setUsername("");
		setEmail("");
		setPassword("");
		setConfirmPassword("");
		setAgreedToTerms(false);
		setError("");
		setSuccess(false);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
			<div
				ref={modalRef}
				className="bg-white rounded-lg shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200 border border-gray-200"
			>
				<div className="p-6">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-xl font-semibold text-gray-900">
							Create Account
						</h2>
						<button
							onClick={handleClose}
							className="text-gray-400 hover:text-gray-600 transition-colors"
						>
							<X size={20} />
						</button>
					</div>

					{error && (
						<div className="mb-4 p-3 bg-red-500 bg-opacity-10 border border-red-500 rounded-md">
							<p className="text-sm text-red-500">{error}</p>
						</div>
					)}

					{success && (
						<div className="mb-4 p-3 bg-green-500 bg-opacity-10 border border-green-500 rounded-md">
							<p className="text-sm text-green-500">
								Account created successfully! Please check your email to verify
								your account.
							</p>
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label
								htmlFor="username"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Username
							</label>
							<input
								type="text"
								id="username"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								required
								className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
							/>
						</div>

						<div>
							<label
								htmlFor="register-email"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Email
							</label>
							<input
								type="email"
								id="register-email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
								placeholder="your@email.com"
							/>
						</div>

						<div>
							<label
								htmlFor="register-password"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Password
							</label>
							<input
								type="password"
								id="register-password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
							/>
						</div>

						<div>
							<label
								htmlFor="confirm-password"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Confirm Password
							</label>
							<input
								type="password"
								id="confirm-password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
								className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
							/>
						</div>

						<div className="flex items-center">
							<input
								id="agree-terms"
								type="checkbox"
								checked={agreedToTerms}
								onChange={(e) => setAgreedToTerms(e.target.checked)}
								className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
							/>
							<label
								htmlFor="agree-terms"
								className="ml-2 block text-sm text-gray-600"
							>
								I agree to the{" "}
								<a href="#" className="text-sky-600">
									Terms
								</a>{" "}
								and{" "}
								<a href="#" className="text-sky-600">
									Privacy Policy
								</a>
							</label>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-sky-600 hover:bg-sky-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? "Creating account..." : "Create Account"}
						</button>

						<div className="text-center text-sm text-gray-500">
							Already have an account?{" "}
							<button
								type="button"
								className="text-sky-600 hover:text-sky-700"
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
