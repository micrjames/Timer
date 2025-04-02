const events = {
	onStart: jest.fn(),
	onStop: jest.fn(),
	onPause: jest.fn(),
	onResume: jest.fn(),
	onError: jest.fn()
};

const mockLogger = {
	log: jest.fn(),
	error: jest.fn()
};

export { events, mockLogger };
