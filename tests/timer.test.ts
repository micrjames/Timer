import { Timer } from "../Timer";
import { TimerState } from "../timer.defns";

describe("Timer", () => {
	let timer: Timer;
	let state: TimerState;
	let expectedState: TimerState;

	beforeEach(() => {
		timer = new Timer({ intervalMS: 500 });		// , {}, { log: jest.fn(), error: jest.fn() }
	    jest.useFakeTimers(); // Set up fake timers before each test
	});
	afterEach(() => {
		state = timer.getState();
		if(state !== TimerState.STOPPED && state !== TimerState.PAUSED)
			timer.stop();

		jest.clearAllTimers(); // Clear all timers after each test
        jest.runOnlyPendingTimers(); // Run any pending timers
        jest.useRealTimers(); // Optionally revert to real timers
	});

	describe("Initialization", () => {
		test("Should initialize with STOPPED state and zero elapsed time.", () => {
			expect(timer.getState()).toBe(TimerState.STOPPED);
			expect(timer.getElapsedMS()).toBe(0);
		});
	});

	describe("Basic Operations", () => {
		test("Should start the timer.", async () => {
			const callback = jest.fn();
			timer.start(callback);
			state = timer.getState();
			expectedState = TimerState.RUNNING;
			expect(state).toBe(expectedState);
		});
		test("Should stop the timer.", () => {
			timer.start(() => {});
			timer.stop();
			state = timer.getState();
			expectedState = TimerState.STOPPED;
			expect(state).toBe(expectedState);
		});
		test("Should pause and resume the timer.", () => {
			timer.start(() => {});
			timer.pause();
			state = timer.getState();
			expectedState = TimerState.PAUSED;
			expect(state).toBe(expectedState);

			timer.resume();
			state = timer.getState();
			expectedState = TimerState.RUNNING;
			expect(state).toBe(expectedState);
		});
		test("Should reset the timer.", () => {
		    timer.start(() => {});
            timer.reset();
			state = timer.getState();
			expectedState = TimerState.STOPPED;
			const elapsedTime = timer.getElapsedMS();
            expect(state).toBe(expectedState);
            expect(elapsedTime).toBe(0);
		});
	});
	describe("Functionality", () => {
		let elapsedTime: number;
		let expectedElapsedTime: number;

		test("Should return elapsed time in seconds.", () => {
			expectedElapsedTime = 3;
		    jest.useFakeTimers();
            timer.start(() => {});
            jest.advanceTimersByTime(expectedElapsedTime * 1000); // Fast-forward 3 seconds
			elapsedTime = timer.getElapsedSeconds();
            expect(elapsedTime).toBe(expectedElapsedTime);
		});
		test("Should return metrics.", () => {
			expectedElapsedTime = 2;
			jest.useFakeTimers();
            timer.start(() => {});
            jest.advanceTimersByTime(expectedElapsedTime * 1000); // Fast-forward 2 seconds
            const metrics = timer.getMetrics();
			elapsedTime = metrics.elapsedSeconds;
            expect(elapsedTime).toBe(expectedElapsedTime);
		});
		test("Should return a snapshot of the timer state.", () => {
		    timer.start(() => {});
            jest.advanceTimersByTime(1500); // Fast-forward 1.5 seconds
            const snapshot = timer.getSnapshot();
			state = snapshot.state;
			elapsedTime = snapshot.elapsedMS;
            expect(state).toBe(TimerState.RUNNING);
            expect(elapsedTime).toBeGreaterThan(0);
		});
		test("Should load a snapshot correctly.", () => {
			expectedElapsedTime = 5000
		    const snapshot = { state: TimerState.STOPPED, elapsedMS: expectedElapsedTime };
            timer.loadSnapshot(snapshot);
			state = timer.getState();
			elapsedTime = timer.getElapsedMS();
            expect(state).toBe(TimerState.STOPPED);
            expect(elapsedTime).toBe(expectedElapsedTime);
		});
	});
	describe("Mis-Operations", () => {
		test("Should throw error when starting an already running timer.", () => {
			timer.start(() => {});
			expect(() => timer.start(() => {})).toThrow('Cannot start: timer is RUNNING');
		});
		test("Should throw error when stopping an already stopped timer.", () => {
			expect(() => timer.stop()).toThrow('Cannot stop: timer already STOPPED');
		});
		test("Should throw error when pausing a stopped timer.", () => {
			expect(() => timer.pause()).toThrow('Cannot pause: timer is STOPPED');
		});
		test("Should throw error when resuming a running timer.", () => {
			timer.start(() => {});
			expect(() => timer.resume()).toThrow('Cannot resume: timer is RUNNING');
		});
		test("Should allow pausing a running timer and throw error when pausing an already paused timer.", () => {
			timer.start(() => {}); // Start the timer
            expect(() => timer.pause()).not.toThrow(); // First pause should succeed
            expect(() => timer.pause()).toThrow('Cannot pause: timer is PAUSED'); // Second pause should throw an error
		});
		test("Should allow stopping a paused timer and throw error when stopping an already stopped timer.", () => {
			timer.start(() => {}); // Start the timer
            timer.pause(); // Pause the timer
            expect(() => timer.stop()).not.toThrow(); // Stopping a paused timer should succeed
            expect(() => timer.stop()).toThrow('Cannot stop: timer already STOPPED'); // Stopping again should throw an error
		});
		test("Should throw error when resuming a stopped timer.", () => {
			expect(() => timer.resume()).toThrow('Cannot resume: timer is STOPPED');
		});
		test("Should throw error when initialized with non-positive interval.", () => {
			expect(() => new Timer({ intervalMS: 0 })).toThrow("Interval must be a positive number");
            expect(() => new Timer({ intervalMS: -1000 })).toThrow("Interval must be a positive number");
	   	});
	});
	describe("Edge Cases", () => {
		test("Should correctly track elapsed time after starting and stopping.", done => {
			  timer.start(() => {});
              jest.advanceTimersByTime(2500); // Fast-forward 2.5 seconds
              expect(timer.getElapsedMS()).toBe(2500);
              timer.stop();
              expect(timer.getElapsedMS()).toBe(0);
              done();
		});
		test("Should correctly track elapsed time after pausing and resuming.", done => {
              timer.start(() => {});
              jest.advanceTimersByTime(1500); // Fast-forward 1.5 seconds
              timer.pause();
              expect(timer.getElapsedMS()).toBeGreaterThan(0);
              jest.advanceTimersByTime(1000); // Fast-forward 1 second while paused, should not move past 1.5 seconds
              timer.resume();
              jest.advanceTimersByTime(1000); // Fast-forward another second, should now move again, by 1s to 2.5 seconds
              expect(timer.getElapsedMS()).toBe(2500); // Should be equal to 2.5 seconds
              timer.stop();
              expect(timer.getElapsedMS()).toBe(0); // Should be 0, since the timer has been reset
              done();
		});
	});
});
