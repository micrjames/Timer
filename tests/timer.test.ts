import { Timer } from "../Timer";
import { TimerState, TimerError } from "../timer.defns";
import { events } from "./testEvts";

jest.useFakeTimers();

const mockLogger = {
	log: jest.fn(),
	error: jest.fn()
};

describe('Timer', () => {
	let timer: Timer;

	beforeEach(() => {
		jest.clearAllMocks();
		timer = new Timer({ intervalMS: 1000 }, events, mockLogger);
	});
	afterEach(() => {
		timer.dispose();
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
});
