import { TimerState, TimerEvents, TimerConfig, TimerError, Metrics, Snapshot } from "./timer.defns";

class Timer {
	private timerId: NodeJS.Timeout | null;
	private state: TimerState;
	private elapsedMS: number;
    private readonly intervalMS: number;
    private readonly events: TimerEvents;
    private readonly maxDurationMS: number;

	constructor(config: TimerConfig, events: TimerEvents = {}) {
		this.timerId = null;
		this.state = TimerState.STOPPED;
		this.elapsedMS = 0;

		if (typeof config.intervalMS !== 'number' || config.intervalMS <= 0)
			throw new Error("Interval must be a positive number");
		this.intervalMS = config.intervalMS;

		this.maxDurationMS = config.maxDurationMS || Number.MAX_SAFE_INTEGER;
		this.events = events;
	}

    /**
     * Starts the timer. Throws an error if the timer is already running or stopped.
     */
	public start() {
		if (this.state !== TimerState.STOPPED) {
			throw new Error(`Cannot start: timer is ${this.state}`);
		}
		this.state = TimerState.RUNNING;
		this.timerId = setInterval(() => {
			this.elapsedMS += this.intervalMS;
		}, this.intervalMS);
	}

    /**
     * Stops the timer and resets the elapsed time to zero. Throws an error if the timer is already stopped.
     */
	public stop() {
		if (this.state === TimerState.STOPPED) {
            throw new Error(`Cannot stop: timer already ${this.state}`);
        }
        clearInterval(this.timerId!);
        this.timerId = null;
        this.state = TimerState.STOPPED;
        this.elapsedMS = 0;
	}

    /**
     * Pauses the timer. Throws an error if the timer is not running.
     */
	public pause() {
		if (this.state !== TimerState.RUNNING) {
            throw new Error(`Cannot pause: timer is ${this.state}`);
        }
        clearInterval(this.timerId!);
        this.timerId = null;
        this.state = TimerState.PAUSED;
	}

	/**
     * Resumes the timer from a paused state. Throws an error if the timer is not paused.
     */
	public resume() {
		if (this.state !== TimerState.PAUSED) {
            throw new Error(`Cannot resume: timer is ${this.state}`);
        }
        this.state = TimerState.RUNNING;
        this.timerId = setInterval(() => {
            this.elapsedMS += this.intervalMS;
        }, this.intervalMS);
	}

	/**
     * Returns the elapsed time in milliseconds.
     * @returns {number} The elapsed time in milliseconds.
     */
	public getElapsedMS(): number {
		return this.elapsedMS;
	}

    /**
     * Returns the current state of the timer.
     * @returns {TimerState} The current state of the timer.
     */
	public getState(): TimerState {
		return this.state;
	}

    /**
     * Returns the elapsed time in seconds.
     * @returns {number} The elapsed time in seconds.
     */
	public getElapsedSeconds(): number {
       return Math.floor(this.elapsedMS / 1000);
    }
	/**
	 * Returns the current metrics of the timer.
	 * @returns {{ elapsedSeconds: number }} An object containing the elapsed time in seconds.
	 */
    public getMetrics(): Metrics {
       return {
           elapsedSeconds: this.getElapsedSeconds(),
       };
    }

    /**
     * Returns a snapshot of the current state of the timer.
     * @returns {{ state: TimerState; elapsedMS: number }} An object containing the current state and elapsed time in milliseconds.
     */
    public getSnapshot(): Snapshot {
       return {
           state: this.state,
           elapsedMS: this.elapsedMS,
       };
    }

	/**
	 * Loads a snapshot to restore the timer's state.
	 * @param {Object} snapshot - The snapshot object containing state and elapsed time.
	 */
    public loadSnapshot(snapshot: Snapshot) {
       this.state = snapshot.state;
       this.elapsedMS = snapshot.elapsedMS;
    }
}

export { Timer };
