# Timer
A Timer object that allows users to start, pause, resume, and cancel the timer, as well as perform actions when the timer starts and stops.

## Table of Contents
* [General Info](#general-info)
* [Technologies Used](#technologies-used)
* [Features](#features)
* [Setup](#setup)
* [Usage](#usage)
* [Project Status](#project-status)
* [Room for Improvement](#room-for-improvement)
* [Contact](#contact)

## General Info
This project was developed as a Timer for a game I made. It provides a flexible and easy-to-use interface for managing time-based events.

## Technologies Used
This project is implemented as a TypeScript class, utilizing modern JavaScript features to create a robust timer with various functionalities.

## Features
The Timer class offers a simple interface for users, allowing them to:
* Start the timer.
* Pause the timer.
* Resume the timer.
* Cancel the timer.
* Pass in callback functions to specify actions to take when the timer starts, pauses, or stops.
* Retrieve elapsed time in seconds and get metrics about the timer's state.

## Setup
To use the Timer class in your project, import it as follows:
```javascript
import { Timer } from "../Timer/Timer";
```

## Usage
### Instantiation
Create an instance of the Timer and set the interval for which the timer fires:
```javascript
const timer = new Timer(1000); // 1 second interval
```

### Starting the Timer
Start the timer and pass a callback function to specify what to do at each interval:
```javascript
timer.start(() => {
  console.log("Timer ticked!");
});
```

### Pausing and Resuming the Timer
You can pause the timer at any time:
```javascript
timer.pause();
```
To resume the timer:
```javascript
timer.resume();
```

### Canceling the Timer
Cancel the timer when you're done with it:
```javascript
timer.stop();
```

### Retrieving Metrics
You can get the elapsed time in seconds and other metrics:
```javascript
const elapsedSeconds = timer.getElapsedSeconds();
const metrics = timer.getMetrics();
console.log(metrics);
```

### Getting a Snapshot
You can retrieve the current state of the timer:
```javascript
const snapshot = timer.getSnapshot();
console.log(snapshot);
```

### Loading a Snapshot
You can restore the timer's state from a snapshot:
```javascript
timer.loadSnapshot(snapshot);
```

## Project Status
The Timer class is fully functional and provides essential timer features. Future enhancements could include additional functionalities such as countdown timers or integration with other game mechanics.

## Room for Improvement
There is always room for improvement in any coding project. Potential enhancements may include:
- Adding more detailed error handling.
- Implementing additional timer features, such as countdown functionality.
- Improving the user interface for better interaction.

## Contact
Feel free to contact me at michaelrjamesjr@icloud.com for any questions or feedback regarding the Timer project.
