class Timer {
    #timerID;
    #interval;

    constructor(interval) {
	   this.#interval = interval;
	}

    start(callback) {
	    this.#timerID = setInterval(callback, this.#interval);
	}

    cancel() {
	    clearInterval(this.#timerID);
	}
}

export { Timer };
