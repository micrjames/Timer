import { Timer } from "../Timer";
import { TimerState, TimerError } from "../timer.defns";
import { events, mockLogger } from "./test.defns";

describe('Timer', () => {
	let timer: Timer;

	beforeEach(() => {
		jest.clearAllMocks();
		timer = new Timer({ intervalMS: 1000, precision: true }, events, mockLogger);
	});
	beforeAll(() => {
		jest.useFakeTimers();
	});
	afterEach(() => {
		timer.dispose();
	});
	afterAll(() => {
		jest.useRealTimers();
	});

	test("Should initialize with stopped state.", () => {
		const state = timer.getState();
		const expectedState = TimerState.STOPPED;
		expect(state).toBe(expectedState);
	});
	test("Should throw on invalid interval.", () => {
		expect(() => new Timer({ intervalMS: -1 })).toThrow(TimerError);
		expect(() => new Timer({ intervalMS: NaN })).toThrow(TimerError);
	});
	test("Should start and stop.", () => {
		const callback = jest.fn();
		timer.start(callback);
		let state = timer.getState();
		let expectedState = TimerState.RUNNING;
		expect(state).toBe(expectedState);
		jest.advanceTimersByTime(3000);
		expect(callback).toHaveBeenCalledTimes(3);
		timer.stop();
		state = timer.getState();
		expectedState = TimerState.STOPPED;
		expect(state).toBe(expectedState);
	});
	test("Should handle callback errors.", () => {
		const errorCallback = () => { throw new Error('Test error'); };
		// const events = { onError: jest.fn() };
		timer = new Timer({ intervalMS: 1000 }, events, mockLogger);
		timer.start(errorCallback);
		jest.advanceTimersByTime(1000);
		expect(events.onError).toHaveBeenCalledWith(expect.any(Error));
		const state = timer.getState();
		const expectedState = TimerState.STOPPED;
		expect(state).toBe(expectedState);
	});
	test('should pause and resume', () => {
		timer.start(() => {});
		jest.advanceTimersByTime(2000);
		timer.pause();
		const state = timer.getState();
		const expectedState = TimerState.PAUSED;
		expect(state).toBe(expectedState);
		const onPauseEvt = events.onPause;
		expect(onPauseEvt).toHaveBeenCalled();
		jest.advanceTimersByTime(2000);
		let elapsedMS = timer.getElapsedMS();
		expect(elapsedMS).toBe(2);
		timer.resume(() => {});
		jest.advanceTimersByTime(2000);
		const onResumeEvt = events.onResume;
		expect(onResumeEvt).toHaveBeenCalled();
		expect(elapsedMS).toBe(2);
		elapsedMS = timer.getElapsedMS();
		expect(elapsedMS).toBe(4);
	});
	test('should not pause when stopped', () => {
		timer.pause();
		const onErrorEvt = events.onError;
		expect(onErrorEvt).toHaveBeenCalledWith(expect.any(TimerError));
	});

	test('should not resume when running', () => {
		timer.start(() => {});
		timer.resume(() => {});
		const onErrorEvt = events.onError;
		expect(onErrorEvt).toHaveBeenCalledWith(expect.any(TimerError));
	});

	test('should handle async start', async () => {
		await timer.startAsync(() => {});
		jest.advanceTimersByTime(3000);
		expect(events.onTick).toHaveBeenCalledTimes(3);
		timer.stop();
		expect(events.onStop).toHaveBeenCalled();
	});

	test('should reset', () => {
		timer.start(() => {});
		jest.advanceTimersByTime(2000);
		timer.reset();
		expect(events.onReset).toHaveBeenCalled();
		expect(timer.getElapsedMS()).toBe(0);
	});

	test('should respect max duration', () => {
		timer = new Timer({ intervalMS: 1000, maxDurationMS: 2000 }, events);
		timer.start(() => {});
		jest.advanceTimersByTime(3000);
		expect(events.onError).toHaveBeenCalledWith(expect.any(TimerError));
		expect(timer.getState()).toBe(TimerState.STOPPED);
	});

	test('should handle precision timing', async () => {
		await timer.start(() => {});
		jest.advanceTimersByTime(5000);
		const metrics = timer.getMetrics();
		expect(metrics.totalTicks).toBe(5);
		expect(metrics.driftMs).toBeLessThan(100);
	});

	test('should adjust interval', async () => {
		await timer.setInterval(500);
		await timer.start(() => {});
		jest.advanceTimersByTime(2000);
		expect(events.onTick).toHaveBeenCalledTimes(4);
	});

	test('should serialize and deserialize', async () => {
		await timer.start(() => {});
		jest.advanceTimersByTime(2000);
		const snapshot = timer.getSnapshot();
		timer.stop();
		timer.loadSnapshot(snapshot);
		expect(timer.getElapsedMS()).toBe(2);
	});

	test('should prevent concurrent operations', async () => {
		const promise1 = timer.start(() => {});
		const promise2 = timer.start(() => {});
		await expect(promise2).rejects.toThrow(TimerError);
	});
});
