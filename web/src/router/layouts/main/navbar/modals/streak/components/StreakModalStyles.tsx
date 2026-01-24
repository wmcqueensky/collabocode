// CSS keyframe styles for animations
export const StreakModalStyles = () => (
	<style>{`
		@keyframes confetti {
			0% {
				transform: translateY(-100vh) rotate(0deg);
				opacity: 1;
			}
			100% {
				transform: translateY(100vh) rotate(720deg);
				opacity: 0;
			}
		}
		.animate-confetti {
			animation: confetti linear forwards;
		}
		@keyframes bounce-slow {
			0%, 100% {
				transform: translateY(0);
			}
			50% {
				transform: translateY(-10px);
			}
		}
		.animate-bounce-slow {
			animation: bounce-slow 2s ease-in-out infinite;
		}
	`}</style>
);
