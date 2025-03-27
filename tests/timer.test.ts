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

	test.todo("Should initialize with stopped state.");
	test.todo("Should throw on invalid interval.");
	test.todo("Should start and stop.");
	test.todo("Should handle callback errors.");
});
