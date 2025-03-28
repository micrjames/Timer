import { TimerState, TimerEvents, Logger, TimerConfig, TimerError } from "./timer.defns";

export class Timer {
	private timerId: NodeJS.Timeout | null;
	private readonly intervalMS: number;
	private state: TimerState;
	private readonly events: TimerEvents;
	private readonly logger?: Logger;

    constructor(config: TimerConfig, events: TimerEvents = {}, logger ?: Logger) {
		this.timerId = null;
		this.state = TimerState.STOPPED;
		this.validateConfig(config);
		this.intervalMS = config.intervalMS;
		this.events = events;
		this.logger = logger;
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
		this.timerId = setInterval(() => {
			try {
				callback();
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
		this.state = TimerState.STOPPED;
		this.events.onStop?.();
		this.logger?.log('Timer stopped');
	}

	public getState(): TimerState {
		return this.state;
	}

	public dispose() {
		this.stop();
	}
}
