import { TimerState } from "./timer.defns";

class Timer {
	private timerId: NodeJS.Timeout;
	private state: TimerState;
	private elapsedMS: number;
	private intervalMS: number;

	constructor(intervalMS: number) {
		this.timerId = null;
		this.state = TimerState.STOPPED;
		this.elapsedMS = 0;

		if(intervalMS <= 0)
			throw new Error("Interval must be a positive number");
		this.intervalMS = intervalMS;
	}

	public start() {
		if (this.state !== TimerState.STOPPED) {
			throw new Error(`Cannot start: timer is ${this.state}`);
		}
		this.state = TimerState.RUNNING;
		this.timerId = setInterval(() => {
			this.elapsedMS += this.intervalMS;
		}, this.intervalMS);
	}

	public stop() {
		if (this.state === TimerState.STOPPED) {
            throw new Error('Cannot stop: timer already stopped');
        }
        clearInterval(this.timerId!);
        this.timerId = null;
        this.state = TimerState.STOPPED;
        this.elapsedMS = 0;
	}

	public pause() {
		if (this.state !== TimerState.RUNNING) {
            throw new Error(`Cannot pause: timer is ${this.state}`);
        }
        clearInterval(this.timerId!);
        this.timerId = null;
        this.state = TimerState.PAUSED;
	}

	public resume() {
		if (this.state !== TimerState.PAUSED) {
            throw new Error(`Cannot resume: timer is ${this.state}`);
        }
        this.state = TimerState.RUNNING;
        this.timerId = setInterval(() => {
            this.elapsedMS += this.intervalMS;
        }, this.intervalMS);
	}

	public getElapsedMS(): number {
		return this.elapsedMS;
	}

	public getState(): TimerState {
		return this.state;
	}
}

export { Timer };
