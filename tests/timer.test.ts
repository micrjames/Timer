import { Timer } from "../Timer";
import { TimerState } from "../timer.defns";

describe("Timer", () => {
	let timer: Timer;
	let state: TimerState;
	let expectedState: TimerState;

	beforeEach(() => {
		timer = new Timer(1000);	// 1 second interval
	});
	afterEach(() => {
		state = timer.getState();
		if(state !== TimerState.STOPPED && state !== TimerState.PAUSED)
			timer.stop();
	});

	describe("Operations", () => {
		test("Should start the timer.", () => {
			timer.start();
			state = timer.getState();
			expectedState = TimerState.RUNNING;
			expect(state).toBe(expectedState);
		});
		test("Should stop the timer.", () => {
			timer.start();
			timer.stop();
			state = timer.getState();
			expectedState = TimerState.STOPPED;
			expect(state).toBe(expectedState);
		});
		test("Should pause and resume the timer.", () => {
			timer.start();
			timer.pause();
			state = timer.getState();
			expectedState = TimerState.PAUSED;
			expect(state).toBe(expectedState);

			timer.resume();
			state = timer.getState();
			expectedState = TimerState.RUNNING;
			expect(state).toBe(expectedState);
		});
	});
	describe("Mis-Operations", () => {
		test("Should throw error when starting an already running timer.", () => {
			timer.start();
			expect(() => timer.start()).toThrow('Cannot start: timer is RUNNING');
		});
		test("Should throw error when stopping an already stopped timer.", () => {
			expect(() => timer.stop()).toThrow('Cannot stop: timer already stopped');
		});
		test("Should throw error when pausing a stopped timer.", () => {
			expect(() => timer.pause()).toThrow('Cannot pause: timer is STOPPED');
		});
		test("Should throw error when resuming a running timer.", () => {
			timer.start();
			expect(() => timer.resume()).toThrow('Cannot resume: timer is RUNNING');
		});
	});
});
