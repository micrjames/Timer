import { TimerState, TimerEvents, Logger, TimerConfig, TimerError } from "./timer.defns";

export class Timer {
	private timerId: NodeJS.Timeout | null;
	private readonly intervalMS: number;
	private state: TimerState;
	private readonly events: TimerEvents;
	private readonly logger?: Logger;
	private elapsedMS: number;
	private lastTick: number;
	private readonly maxDurationMS: number;

    constructor(config: TimerConfig, events: TimerEvents = {}, logger ?: Logger) {
		this.timerId = null;
		this.state = TimerState.STOPPED;
		this.validateConfig(config);
		this.intervalMS = config.intervalMS;
		this.maxDurationMS = config.maxDurationMS || Number.MAX_SAFE_INTEGER;
		this.events = events;
		this.logger = logger;
		this.elapsedMS = 0;
		this.lastTick = 0;
		if(config.autoStart) this.start(() => {});
	}

	private validateConfig(config: TimerConfig) {
		if(!Number.isFinite(config.intervalMS) || config.intervalMS <= 0) {
			const error = new TimerError('Interval must be a postive finite number');
			this.logger?.error('Invalid interval', error);
			throw error;
		}
		if(typeof config.autoStart != 'undefined' && typeof config.autoStart !== 'boolean') {
			const error = new TimerError('autoStart must be a boolean');
			this.logger?.error('Invalid autoStart', error);
			throw error;
		}

		if (config.maxDurationMS && (!Number.isFinite(config.maxDurationMS) || config.maxDurationMS <= 0)) {
		  throw new TimerError('Max duration must be a positive finite number');
		}
	}

    public start(callback: () => void): () => void {
		if(this.state !== TimerState.STOPPED) {
			const error = new TimerError(`Cannot start: timer is ${this.state}`);
			this.events.onError?.(error);
			this.logger?.error('Start failed', error);
			throw error;
		}
		if(typeof callback !== 'function') {
			const error = new TimerError('Callback must be a function');
			this.events.onError?.(error);
			this.logger?.error('Invalid callback', error);
			throw error;
		}

		this.state = TimerState.RUNNING;
		this.lastTick = Date.now();
		this.timerId = setInterval(() => {
			const now = Date.now();
			this.elapsedMS += now - this.lastTick;
			this.lastTick = now;
		    if (this.elapsedMS > this.maxDurationMS) {
				this.stop();
				const error = new TimerError('Maximum duration exceeded');
				this.events.onError?.(error);
				this.logger?.error('Max duration exceeded', error);
				return;
		    }
			try {
				callback();
				this.events.onTick?.(this.getElapsedMS());
				this.logger?.log('Timer tick');
			} catch(error) {
				this.stop();
				const timerError = new TimerError('Callback execution failed');
				this.events.onError?.(error instanceof Error ? error : timerError);
				this.logger?.error('Callback error', error instanceof Error ? error: timerError);
			}
		}, this.intervalMS);
		this.events.onStart?.();
		this.logger?.log('Timer started');
		return this.stop.bind(this);
	}

	public pause(): void {
		if (this.state !== TimerState.RUNNING) {
		  const error = new TimerError(`Cannot pause: timer is ${this.state}`);
		  this.events.onError?.(error);
		  this.logger?.error('Pause failed', error);
		  return;
		}
		if (this.timerId !== null) {
		  clearInterval(this.timerId);
		  this.timerId = null;
		}
		this.state = TimerState.PAUSED;
		this.events.onPause?.();
		this.logger?.log('Timer paused');
    }
	public resume(callback: () => void): void {
		if (this.state !== TimerState.PAUSED) {
		  const error = new TimerError(`Cannot resume: timer is ${this.state}`);
		  this.events.onError?.(error);
		  this.logger?.error('Resume failed', error);
		  return;
		}
		this.state = TimerState.RUNNING;
		this.lastTick = Date.now();
		this.timerId = setInterval(() => {
		  const now = Date.now();
		  this.elapsedMS += now - this.lastTick;
		  this.lastTick = now;
		  if (this.elapsedMS > this.maxDurationMS) {
			this.stop();
			const error = new TimerError('Maximum duration exceeded');
			this.events.onError?.(error);
			this.logger?.error('Max duration exceeded', error);
			return;
		  }
		  try {
			callback();
			this.events.onTick?.(this.getElapsedMS());
			this.logger?.log('Timer tick');
		  } catch (error) {
			this.stop();
			this.events.onError?.(error instanceof Error ? error : new TimerError('Callback execution failed'));
			this.logger?.error('Callback error', error instanceof Error ? error : undefined);
		  }
		}, this.intervalMS);
		this.events.onResume?.();
		this.logger?.log('Timer resumed');
	}

    public stop() {
		if(this.state === TimerState.STOPPED) {
			this.events.onError?.(new TimerError('Cannot stop: timer already stopped'));
			this.logger?.log('Stop called on stopped timer');
			return;
		}
		if(this.timerId !== null) {
			clearInterval(this.timerId);
			this.timerId = null;
		}
		this.elapsedMS = 0;
		this.state = TimerState.STOPPED;
		this.events.onStop?.();
		this.logger?.log('Timer stopped');
	}

	public async startAsync(callback: () => void): Promise<void> {
		return new Promise((resolve, reject) => {
		  try {
			this.start(() => {
			  try {
				callback();
				if (this.state === TimerState.STOPPED) resolve();
			  } catch (error) {
				this.stop();
				reject(error instanceof Error ? error : new TimerError('Async callback failed'));
			  }
			});
		  } catch (error) {
			reject(error);
		  }
		});
	}

	public reset(): void {
		this.stop();
		this.elapsedMS = 0;
		this.events.onReset?.();
		this.logger?.log('Timer reset');
	}

	public getState(): TimerState {
		return this.state;
	}

	public getElapsedMS(): number {
		return Math.floor(this.elapsedMS/1000);
	}

	public dispose() {
		this.stop();
	}
}
