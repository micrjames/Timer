import { Timer } from "../Timer";
import { TimerState, TimerError } from "../timer.defns";

jest.useFakeTimers();

const mockLogger = {
	log: jest.fn(),
	error: jest.fn()
};

describe('Timer', () => {
	let timer: Timer;

	beforeEach(() => {
		timer = new Timer({ intervalMS: 1000 }, {}, mockLogger);
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
		const events = { onError: jest.fn() };
		timer = new Timer({ intervalMS: 1000 }, events, mockLogger);
		timer.start(errorCallback);
		jest.advanceTimersByTime(1000);
		expect(events.onError).toHaveBeenCalledWith(expect.any(Error));
		const state = timer.getState();
		const expectedState = TimerState.STOPPED;
		expect(state).toBe(expectedState);
	});
});
