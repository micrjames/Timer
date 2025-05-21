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

export { TimerState, Metrics, Snapshot };
