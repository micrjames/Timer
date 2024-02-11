export class Timer {
    private timerID: ReturnType<typeof setInterval>;
    private interval: number;

    constructor(interval: number) {
	   this.interval = interval;
	}

    start(cb: () => void) {
	    this.timerID = setInterval(cb, this.interval);
	}

    cancel() {
	    clearInterval(this.timerID);
	}
}
