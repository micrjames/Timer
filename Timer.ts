import { TimerState } from "./timer.defns";

class Timer {
	private timerId: NodeJS.Timeout;
	private state: TimerState;
	private elapsedMS: number;
	private intervalMS: number;

	constructor(intervalMS: number) {
		this.intervalMS = intervalMS;
	}
}

export { Timer };
