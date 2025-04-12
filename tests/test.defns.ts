const events = {
	onStart: jest.fn(),
	onStop: jest.fn(),
	onPause: jest.fn(),
	onResume: jest.fn(),
	onReset: jest.fn(),
	onTick: jest.fn(),
	onError: jest.fn(),
	onDrift: jest.fn(),
	onComplete: jest.fn()
};

const mockLogger = {
	log: jest.fn(),
	error: jest.fn()
};

export { events, mockLogger };
