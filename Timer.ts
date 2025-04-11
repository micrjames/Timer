import { TimerState, TimerEvents, Logger, TimerConfig, TimerError, TimerMetrics, TimerSnapshot } from "./timer.defns";

export class Timer {
	private timerId: NodeJS.Timeout | null;
	private readonly intervalMS: number;
	private state: TimerState;
	private readonly events: TimerEvents;
	private readonly logger?: Logger;
	private elapsedMS: number;
	private lastTick: number;
	private readonly maxDurationMS: number;
	private readonly precision: boolean;
	private tickCount: number;
	private totalTickTime: number;
	private lock: boolean;

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
		this.tickCount = 0;
		this.totalTickTime = 0;
		this.lock = false;
		this.precision = config.precision || false;
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

    public async start(callback: () => void): Promise<() => void> {
		await this.acquireLock();
		try {
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
			const tick = () => {
				const now = performance.now();
				const delta = now - this.lastTick;
				this.elapsedMS += delta;
				this.totalTickTime += delta;
				this.tickCount++;
				this.lastTick = now;
				if (this.elapsedMS > this.maxDurationMS) {
					this.stop();
					const error = new TimerError('Maximum duration exceeded');
					this.events.onError?.(error);
					this.logger?.error('Max duration exceeded', error);
					return;
				}
				const drift = this.precision ? (this.tickCount * this.intervalMS - this.elapsedMS) : 0;
				if (drift > this.intervalMS / 2) {
				  this.events.onDrift?.(drift);
				  this.logger?.log(`Drift detected: ${drift}ms`);
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
			};
			this.timerId = setInterval(tick, this.precision ? this.intervalMS - (this.elapsedMS % this.intervalMS) : this.intervalMS);
			this.events.onStart?.();
			this.logger?.log('Timer started');
			return this.stop.bind(this);
		} catch(error) {
		  this.events.onError?.(error instanceof Error ? error : new TimerError('Start failed'));
		  this.logger?.error('Start error', error instanceof Error ? error : undefined);
		  throw error;
		} finally {
		  this.releaseLock();
		}
	}

	public async pause(): Promise<void> {
		await this.acquireLock();
		try {
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
		} catch (error) {
		  this.events.onError?.(error instanceof Error ? error : new TimerError('Pause failed'));
		  this.logger?.error('Pause error', error instanceof Error ? error : undefined);
		} finally {
		  this.releaseLock();
		}
    }
	public async resume(callback: () => void): Promise<void> {
		await this.acquireLock();
		try {
			if (this.state !== TimerState.PAUSED) {
			  const error = new TimerError(`Cannot resume: timer is ${this.state}`);
			  this.events.onError?.(error);
			  this.logger?.error('Resume failed', error);
			  return;
			}
			this.state = TimerState.RUNNING;
			this.lastTick = performance.now();
			this.timerId = setInterval(() => {
				const now = performance.now();
				this.elapsedMS += now - this.lastTick;
				this.totalTickTime += now - this.lastTick;
				this.tickCount++;
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
		} catch (error) {
		  this.events.onError?.(error instanceof Error ? error : new TimerError('Resume failed'));
		  this.logger?.error('Resume error', error instanceof Error ? error : undefined);
		} finally {
		  this.releaseLock();
		}
	}

	public async stop(): Promise<void> {
		await this.acquireLock();
		try {
		  if (this.state === TimerState.STOPPED) {
			this.events.onError?.(new TimerError('Cannot stop: timer already stopped'));
			this.logger?.log('Stop called on stopped timer');
			return;
		  }
		  if (this.timerId !== null) {
			clearInterval(this.timerId);
			this.timerId = null;
		  }
		  this.state = TimerState.STOPPED;
		  this.elapsedMS = 0;
		  this.tickCount = 0;
		  this.totalTickTime = 0;
		  this.events.onStop?.();
		  this.logger?.log('Timer stopped');
		} catch (error) {
		  this.events.onError?.(error instanceof Error ? error : new TimerError('Stop failed'));
		  this.logger?.error('Stop error', error instanceof Error ? error : undefined);
		} finally {
		  this.releaseLock();
		}
	}

	public async startAsync(callback: () => void): Promise<void> {
		/*
		return new Promise((resolve, reject) => {
		  try {
			this.start(() => {
			  try {
				callback();
				// if (this.state === TimerState.STOPPED) resolve();
			  } catch (error) {
				this.stop();
				reject(error instanceof Error ? error : new TimerError('Async callback failed'));
			  }
			});
			resolve();
		  } catch (error) {
			reject(error);
		  }
		});
	   */
		return new Promise((resolve, reject) => {
		  this.start(callback).then(() => {
			const interval = setInterval(() => {
			  if (this.state === TimerState.STOPPED) {
				clearInterval(interval);
				resolve();
			  }
			}, 10);
		  }).catch(reject);
		});
	}

	public async reset(): Promise<void> {
		await this.acquireLock();
		try {
		  this.stop();
		  this.elapsedMS = 0;
		  this.tickCount = 0;
		  this.totalTickTime = 0;
		  this.events.onReset?.();
		  this.logger?.log('Timer reset');
		} catch (error) {
		  this.events.onError?.(error instanceof Error ? error : new TimerError('Reset failed'));
		  this.logger?.error('Reset error', error instanceof Error ? error : undefined);
		} finally {
		  this.releaseLock();
		}
	}

	public getState(): TimerState {
		return this.state;
	}

	public getElapsedMS(): number {
		return Math.floor(this.elapsedMS/1000);
	}

	  private async acquireLock(): Promise<void> {
		if (this.lock) {
		  throw new TimerError('Operation in progress');
		}
		this.lock = true;
	  }

	  private releaseLock(): void {
		this.lock = false;
	  }

	  public getMetrics(): TimerMetrics {
		return {
		  totalTicks: this.tickCount,
		  averageTickMs: this.tickCount > 0 ? this.totalTickTime / this.tickCount : 0,
		  driftMs: this.tickCount > 0 ? (this.tickCount * this.intervalMS - this.elapsedMS) : 0,
		};
	  }

	  public getSnapshot(): TimerSnapshot {
		return {
		  state: this.state,
		  elapsedMs: this.elapsedMS,
		};
	  }

	  public loadSnapshot(snapshot: TimerSnapshot): void {
		if (this.state !== TimerState.STOPPED) {
		  throw new TimerError('Can only load snapshot when stopped');
		}
		this.state = snapshot.state;
		this.elapsedMS = snapshot.elapsedMs;
	  }

	public dispose() {
		this.stop();
	}

  public async setInterval(newIntervalMs: number): Promise<void> {
    await this.acquireLock();
    try {
      if (!Number.isFinite(newIntervalMs) || newIntervalMs <= 0) {
        throw new TimerError('New interval must be a positive finite number');
      }
      if (this.state === TimerState.RUNNING) {
        throw new TimerError('Cannot change interval while running');
      }
      (this as any).intervalMs = newIntervalMs; // Type hack due to readonly
      this.logger?.log(`Interval changed to ${newIntervalMs}ms`);
    } catch (error) {
      this.events.onError?.(error instanceof Error ? error : new TimerError('Set interval failed'));
      this.logger?.error('Set interval error', error instanceof Error ? error : undefined);
      throw error;
    } finally {
      this.releaseLock();
    }
  }
}
