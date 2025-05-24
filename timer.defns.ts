enum TimerState {
    STOPPED = 'STOPPED',
    RUNNING = 'RUNNING',
    PAUSED = 'PAUSED',
}

type Metrics = {
	elapsedSeconds: number;
};

type Snapshot = {
	state: TimerState;
	elapsedMS: number;
};

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
}

class TimerError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TimerError';
    }
}

export { TimerState, Metrics, Snapshot, TimerEvents, TimerConfig, TimerError };
