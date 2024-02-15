import { Countdown } from "../Countdown";

describe("A countdown timer.", () => {
   let countdown: Countdown;
   let secondsRemaining: number;
   let doEachSec: Function;
   let doAtEnd: Function;
   beforeAll(() => {
	  jest.useFakeTimers();
	  doEachSec = jest.fn();
	  doAtEnd = jest.fn();
	  secondsRemaining = 30;
	  countdown = new Countdown(secondsRemaining, doEachSec, doAtEnd);
   });
   afterAll(() => {
	  jest.useRealTimers();
   });
   test("Should not be undefined.", () => {
	  expect(countdown).not.toBeUndefined();
   });
   describe("doEachSec", () => {
	  test("Should have 30 seconds remaining.", () => {
		 expect(countdown.seconds).toBe(secondsRemaining);
	  });
	  describe("Running for 10 seconds.", () => {
		 test("Should be called 10 times.", () => {
			jest.advanceTimersByTime(10000);
			expect(doEachSec).toHaveBeenCalledTimes(10);
		 });
		 test("Should have 10 less seconds remaining.", () => {
			expect(countdown.seconds).toBe(20);
		 });
	  });
	  describe("Running for another 20 seconds.", () => {
		 test("Should be called 30 times.", () => {
			jest.advanceTimersByTime(20000);
			expect(doEachSec).toHaveBeenCalledTimes(30);
		 });
		 test("Should not be called again.", () => {
			jest.advanceTimersByTime(1000);
			expect(doEachSec).not.toHaveBeenCalledTimes(31);
		 });
	  });
   });
   describe("doAtEnd", () => {
	  test("Should have been called.", () => {
		 expect(doAtEnd).toHaveBeenCalled();
	  });
	  test("Should have 0 seconds remaining.", () => {
		 expect(countdown.seconds).toBe(0);
	  });
   });
});
