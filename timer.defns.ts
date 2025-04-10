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
	onDrift?: (driftMS: number) => void;
}

interface TimerConfig {
	intervalMS: number;
	autoStart?: boolean;
	maxDurationMS?: number;
	precision?: boolean;	// High-precision mode
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

interface TimerMetrics {
	totalTicks: number;
	averageTickMs: number;
	driftMs: number;
}

interface TimerSnapshot {
	state: TimerState;
	elapsedMs: number;
	remainingMs?: number;
	initialMs?: number;
}

export { TimerState, TimerEvents, TimerConfig, Logger, TimerError, TimerMetrics, TimerSnapshot };
