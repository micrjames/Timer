import { Timer } from "./Timer";
import { TimerEvents, TimerState, TimerError, TimerMetrics, TimerSnapshot } from "./timer.defns";

export class CountdownTimer {
	private readonly timer: Timer;
	private remainingMS: number;
	private readonly initialMS: number;
	private readonly intervalMS: number;
	private readonly events: TimerEvents;

	constructor(seconds: number, intervalMS: number = 1000, events: TimerEvents = {}, autoStart: boolean = false, precision: boolean = false) {
		this.validateInputs(seconds, intervalMS);
		this.initialMS = seconds * 1000;
		this.remainingMS = this.initialMS;
		this.intervalMS = intervalMS;
		this.events = events;
		this.timer = new Timer({ intervalMS, autoStart, maxDurationMS: this.initialMS * 2, precision }, events);
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

	public start(): Promise<() => void> {
		return this.timer.start(() => {
			this.remainingMS -= this.intervalMS;
			this.events.onTick?.(this.getRemainingSeconds());
			if(this.remainingMS <= 0) {
				this.timer.stop();
				this.events.onComplete?.();
			}
		});
	}

	public async startAsync(): Promise<void> {
		return this.timer.startAsync(() => {
		  this.remainingMS -= this.intervalMS;
		  this.events.onTick?.(this.getRemainingSeconds());
		  if (this.remainingMS <= 0) {
			this.timer.stop();
			this.events.onComplete?.();
		  }
		});
	}

	public async resume(): Promise<void> {
		await this.timer.resume(() => {
		  this.remainingMS -= this.intervalMS;
		  this.events.onTick?.(this.getRemainingSeconds());
		  if (this.remainingMS <= 0) {
			this.timer.stop();
			// this.events.onStop?.();
			this.events.onComplete?.();
		  }
		});
	}

	public async pause(): Promise<void> {
		await this.timer.pause();
	}

	public async stop(): Promise<void> {
		await this.timer.stop();
	}

	public async reset(): Promise<void> {
		await this.timer.reset();
		this.remainingMS = this.initialMS;
		this.events.onReset?.();
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


	public async setTime(seconds: number): Promise<void> {
		if (!Number.isFinite(seconds) || seconds <= 0) {
		  throw new TimerError('Time must be a positive finite number');
		}
		await this.timer.reset();
		this.remainingMS = seconds * 1000;
		this.initialMS = this.remainingMS;
	}

	public async setInterval(newIntervalMs: number): Promise<void> {
		await this.timer.setInterval(newIntervalMs);
		(this as any).intervalMs = newIntervalMs; // Type hack due to readonly
	}

	public getProgress(): number {
		return Math.min(1, Math.max(0, 1 - this.remainingMS / this.initialMS));
	}

	public getMetrics(): TimerMetrics {
		return this.timer.getMetrics();
	}

	public getSnapshot(): TimerSnapshot {
		return {
		  ...this.timer.getSnapshot(),
		  remainingMs: this.remainingMS,
		  initialMs: this.initialMS,
		};
	}

	public loadSnapshot(snapshot: TimerSnapshot): void {
		this.timer.loadSnapshot(snapshot);
		if (snapshot.remainingMs !== undefined && snapshot.initialMs !== undefined) {
		  this.remainingMS = snapshot.remainingMs;
		  this.initialMS = snapshot.initialMs;
		}
	}
}
