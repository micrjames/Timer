import { CountdownTimer } from "../CountdownTimer";
import { events } from "./test.defns";
import {TimerState} from "../timer.defns";

describe("CountdownTimer", () => {
	let countdown: CountdownTimer;

	beforeEach(() => {
		jest.clearAllMocks();
		countdown = new CountdownTimer(5, 1000, events, false);
	});
	beforeAll(() => {
		jest.useFakeTimers();
	});
	afterEach(() => {
		countdown.dispose();
	});
	afterAll(() => {
		jest.useRealTimers();
	});

	test("Should initialize correctly.", () => {
		const remainingSeconds = countdown.getRemainingSeconds();
		const state = countdown.getState();
		const expectedState = TimerState.STOPPED;
		expect(remainingSeconds).toBe(5);
		expect(state).toBe(expectedState);
	});
	test("Should countdown.", () => {
		countdown.start();
		jest.advanceTimersByTime(5000);
		const remainingSeconds = countdown.getRemainingSeconds();
		const state = countdown.getState();
		const expectedState = TimerState.STOPPED;
		expect(remainingSeconds).toBe(0);
		expect(state).toBe(expectedState);
	});

	test('should track progress', () => {
		countdown.start();
		jest.advanceTimersByTime(2000);
		expect(countdown.getProgress()).toBeCloseTo(0.4, 1);
		jest.advanceTimersByTime(3000);
		expect(countdown.getProgress()).toBe(1);
	});

	test('should pause and resume countdown', () => {
		countdown.start();
		jest.advanceTimersByTime(2000);
		countdown.pause();
		let remainingSeconds = countdown.getRemainingSeconds();
		expect(remainingSeconds).toBe(3);
		jest.advanceTimersByTime(2000);
		remainingSeconds = countdown.getRemainingSeconds();
		expect(remainingSeconds).toBe(3);
		countdown.resume();
		jest.advanceTimersByTime(3000);
		remainingSeconds = countdown.getRemainingSeconds();
		expect(remainingSeconds).toBe(0);
	});

	test('should handle async start', async () => {
		await countdown.startAsync();
		jest.advanceTimersByTime(5000);
		expect(events.onComplete).toHaveBeenCalled();
	});

	test('should reset countdown', () => {
		countdown.start();
		jest.advanceTimersByTime(2000);
		countdown.reset();
		expect(events.onReset).toHaveBeenCalled();
		expect(countdown.getRemainingSeconds()).toBe(5);
	});
});
