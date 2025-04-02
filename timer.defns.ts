enum TimerState {
	STOPPED = 'STOPPED',
	RUNNING = 'RUNNING',
	PAUSED = 'PAUSED',
}

interface TimerEvents {
	onStart?: () => void;
	onStop?: () => void;
	onPause?: () => void;
	onResume?: () => void;
	onComplete?: () => void;
	onReset?: () => void;
	onError?: (error: Error) => void;
	onTick?: (elapsedSeconds: number) => void;
}

interface TimerConfig {
	intervalMS: number;
	autoStart?: boolean;
	maxDurationMS?: number;
}

interface Logger {
	log: (message: string) => void;
	error: (message: string, error?: Error) => void;
}

class TimerError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'TimerError';
	}
}

export { TimerState, TimerEvents, TimerConfig, Logger, TimerError };
