import { Timer } from "./Timer";
import { TimerEvents, TimerState, TimerError } from "./timer.defns";

export class CountdownTimer {
	private readonly timer: Timer;
	private remainingMS: number;
	private readonly initialMS: number;
	private readonly intervalMS: number;
	private readonly events: TimerEvents;

	constructor(seconds: number, intervalMS: number = 1000, events: TimerEvents = {}, autoStart: boolean = false) {
		this.validateInputs(seconds, intervalMS);
		this.initialMS = seconds * 1000;
		this.remainingMS = this.initialMS;
		this.intervalMS = intervalMS;
		this.events = events;
		this.timer = new Timer({ intervalMS, autoStart }, events);
		if(autoStart) this.start();
	}

	private validateInputs(seconds: number, intervalMS: number) {
		if(!Number.isFinite(seconds) || seconds <= 0) {
			throw new TimerError('Countdown duration must be a positive finite number');
		}
		if(!Number.isFinite(intervalMS) || intervalMS <= 0) {
			throw new TimerError('Interval must be a positive finite number');
		}
	}

	public start(): () => void {
		return this.timer.start(() => {
			this.remainingMS -= this.intervalMS;
			this.events.onTick?.(this.getRemainingSeconds());
			if(this.remainingMS <= 0) {
				this.timer.stop();
				this.events.onStop?.();
			}
		});
	}

	public resume(): void {
		this.timer.resume(() => {
		  this.remainingMS -= this.intervalMS;
		  this.events.onTick?.(this.getRemainingSeconds());
		  if (this.remainingMS <= 0) {
			this.timer.stop();
			this.events.onStop?.();
		  }
		});
	}

	public pause() {
		this.timer.pause();
	}

	public stop() {
		this.timer.stop();
	}

	public reset(): void {
		this.stop();
		this.remainingMS = this.initialMS;
	}

	public getRemainingSeconds(): number {
		return Math.ceil(this.remainingMS / 1000);
	}

	public getState(): TimerState {
		return this.timer.getState();
	}

	public dispose() {
		this.timer.dispose();
	}

	public getElapsedSeconds(): number {
		return Math.floor((this.initialMS - this.remainingMS) / 1000);
	}

	public getProgress(): number {
		return Math.min(1, Math.max(0, 1 - this.remainingMS / this.initialMS));
	}
}
