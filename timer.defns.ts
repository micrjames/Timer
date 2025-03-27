enum TimerState {
	STOPPED = 'STOPPED',
	RUNNING = 'RUNNING',
	PAUSED = 'PAUSED',
}

interface TimerEvents {
	onStart?: () => void;
	onStop?: () => void;
	onError?: (error: Error) => void;
}

interface TimerConfig {
	intervalMS: number;
	autoStart?: boolean;
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
