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
	 * Starts the timer.
	 * 
	 * This method begins the timer and triggers the onStart event if defined in the
	 * TimerEvents configuration. It throws an error if the timer is already running or paused.
	 * 
	 * @param {Function} callback - A callback function that is called at each tick of the timer.
	 * @throws {TimerError} Throws an error if the timer is already running or paused.
	 */
	public start(callback: () => void) {
		if (this.state !== TimerState.STOPPED) {
			throw new TimerError(`Cannot start: timer is ${this.state}`);	
		}
		this.state = TimerState.RUNNING;
		const tick = async () => {
			this.elapsedMS += this.intervalMS;
			callback();
			this.events.onTick?.(this.elapsedMS / 1000); // Convert to seconds
			if(this.elapsedMS >= this.maxDurationMS) {
				this.stop();
			}
		};
		this.timerId = setInterval(tick, this.intervalMS);
		this.events.onStart?.();
	}

	/**
	 * Stops the timer and resets the elapsed time to zero.
	 * 
	 * This method stops the timer if it is currently running or paused, and resets the
	 * elapsed time to zero. It throws an error if the timer is already stopped.
	 * 
	 * @throws {TimerError} Throws an error if the timer is already stopped.
	 */
	public stop() {
		if (this.state === TimerState.STOPPED) {
			throw new TimerError(`Cannot stop: timer already ${this.state}`);
		}
		clearInterval(this.timerId!);
		this.timerId = null;
		this.state = TimerState.STOPPED;
		this.elapsedMS = 0;
	}

	/**
	 * Pauses the timer.
	 * 
	 * This method pauses the timer if it is currently running and updates the state to PAUSED.
	 * It throws an error if the timer is not running.
	 * 
	 * @throws {TimerError} Throws an error if the timer is not running.
	 */
	public pause() {
		if (this.state !== TimerState.RUNNING) {
            throw new TimerError(`Cannot pause: timer is ${this.state}`);
        }
        clearInterval(this.timerId!);
        this.timerId = null;
        this.state = TimerState.PAUSED;
	}

	/**
	 * Resumes the timer from a paused state.
	 * 
	 * This method resumes the timer if it is currently paused and updates the state to RUNNING.
	 * It throws an error if the timer is not paused.
	 * 
	 * @throws {TimerError} Throws an error if the timer is not paused.
	 */
	public resume() {
		if (this.state !== TimerState.PAUSED) {
            throw new TimerError(`Cannot resume: timer is ${this.state}`);
        }
        this.state = TimerState.RUNNING;
        this.timerId = setInterval(() => {
            this.elapsedMS += this.intervalMS;
        }, this.intervalMS);
	}

	/**
	 * Resets the timer to its initial state.
	 * 
	 * This method stops the timer if it is currently running, resets the elapsed time to zero,
	 * and updates the state to STOPPED. It also triggers the onReset event if defined in the
	 * TimerEvents configuration. Throws an error if the timer is already stopped.
	 * 
	 * @throws {TimerError} Throws an error if the timer is already in the STOPPED state.
	 */
	public reset() {
		if (this.state === TimerState.STOPPED) {
			throw new TimerError("Cannot reset: timer is already stopped");
		} else {
			this.stop(); // Stop the timer if it's running
		}
		
		this.elapsedMS = 0; // Reset elapsed time
		this.state = TimerState.STOPPED; // Set state to STOPPED
		this.events.onReset?.(); // Trigger the onReset event if defined
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
