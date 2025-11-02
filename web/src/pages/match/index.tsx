import { useParams } from "react-router-dom";
import { useSession } from "../../hooks/useSession";
import { useState, useEffect } from "react";

const MatchPage = () => {
	const { sessionId } = useParams();
	const { session, participants, loading, submitCode } = useSession(
		sessionId ?? null
	);
	const [code, setCode] = useState("");
	const [timeRemaining, setTimeRemaining] = useState(0);

	useEffect(() => {
		if (!session) return;

		// Calculate time remaining
		if (session.started_at) {
			const startTime = new Date(session.started_at).getTime();
			const endTime = startTime + session.time_limit * 60 * 1000;
			const now = Date.now();
			const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
			setTimeRemaining(remaining);

			const interval = setInterval(() => {
				setTimeRemaining((prev) => Math.max(0, prev - 1));
			}, 1000);

			return () => clearInterval(interval);
		}
	}, [session]);

	const handleSubmit = async () => {
		// Run tests (you'll need to implement test runner)
		//const testResults = runTests(code, session?.problem);
		// await submitCode(code, testResults);
		console.log("Submitting code:", code);
	};

	if (loading) return <div>Loading session...</div>;
	if (!session) return <div>Session not found</div>;

	return (
		<div className="min-h-screen bg-[#171717] text-white">
			{/* Header with timer and participants */}
			<div className="bg-[#1f1f1f] p-4 border-b border-gray-700">
				<div className="flex justify-between items-center">
					<h1 className="text-xl font-bold">{session.problem?.title}</h1>
					<div className="text-2xl font-mono">
						{Math.floor(timeRemaining / 60)}:
						{(timeRemaining % 60).toString().padStart(2, "0")}
					</div>
				</div>
			</div>

			{/* Main coding interface */}
			<div className="grid grid-cols-2 gap-4 p-4">
				{/* Problem description */}
				<div className="bg-[#1f1f1f] rounded-lg p-4">
					<h2 className="text-lg font-semibold mb-2">Problem</h2>
					<p className="text-gray-300">{session.problem?.description}</p>
					{/* Add test cases display */}
				</div>

				{/* Code editor */}
				<div className="bg-[#1f1f1f] rounded-lg p-4">
					<h2 className="text-lg font-semibold mb-2">Code</h2>
					<textarea
						value={code}
						onChange={(e) => setCode(e.target.value)}
						className="w-full h-96 bg-[#2a2a2a] p-4 rounded font-mono text-sm"
						placeholder={session.problem?.starter_code?.[session.language]}
					/>
					<button
						onClick={handleSubmit}
						className="mt-4 px-6 py-2 bg-[#5bc6ca] text-black rounded hover:bg-[#48b4b8]"
					>
						Submit Solution
					</button>
				</div>
			</div>

			{/* Participants sidebar */}
			<div className="fixed right-4 top-20 w-64 bg-[#1f1f1f] rounded-lg p-4">
				<h3 className="font-semibold mb-2">Participants</h3>
				{participants.map((p) => (
					<div key={p.id} className="flex items-center justify-between py-2">
						<span>{p.user?.username}</span>
						{p.is_correct && <span className="text-green-500">✓</span>}
					</div>
				))}
			</div>
		</div>
	);
};

export default MatchPage;
