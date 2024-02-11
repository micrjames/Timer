export class Timer {
    protected timerID: ReturnType<typeof setInterval>;
    protected interval: number;

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
