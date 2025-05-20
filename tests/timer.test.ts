import { Timer } from "../Timer";
import { TimerState } from "../timer.defns";

describe("Timer", () => {
	let timer: Timer;

	beforeEach(() => {
		timer = new Timer(1000);	// 1 second interval
	});

	test.todo("Should start the timer.");
	test.todo("Should stop the timer.");
	test.todo("Should pause and resume the timer.");
	test.todo("Should throw error when starting an already running timer.");
	test.todo("Should throw error when stopping an already stopped timer.");
	test.todo("Should throw error when pausing a stopped timer.");
	test.todo("Should throw error when resuming a running timer.");
});
