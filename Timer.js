class Timer {
    #timerID;

    start(callback) {
	    this.#timerID = setInterval(callback, interval);
	}

    cancel() {
	    clearInterval(this.#timerID);
	}
}

export { Timer };
