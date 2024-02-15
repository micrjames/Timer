# Timer
A Timer object that allows a user to start and cancel the timer, do something when the timer starts.

## Table Of Contents
* [General Info](#general-info)
* [Technologies Used](#technologies-used)
* [Features](#features)
* [Setup](#setup)
* [Usage](#usage)
* [Project Status](#project-status)
* [Room for Improvement](#room-for-improvement)
* [Contact](#contact)

## General Info
This project was developed as a Timer for a game I made. 

## Technologies Used
This entire project is created as a Typescript class. It contains the necessary methods and fields to create and stop a timer.

## Features
This project is fairly simple from the point of view of the user. The user only needs to instantiate the class and set what to do when the timer starts and ends.
* Start the timer.
* Cancel the timer.
* Pass in a callback function to specify what to do on the timer start.

## Setup
Import the class into your project in the usual way.
```
const Timer = require("../Timer/Timer");
```
## Usage
Instantiate the timer and set the interval for which the timer fires.
```
const timer = new Timer(10);
```
Then, start the timer and pass what to do each interval.
```
timer.start(() => {
  // do something here.
});
```
Cancel the timer when you're done with it.
```
timer.cancel();
```
## Project Status
This is about all that can be done with a timer. Anything else would be done as an inherited class. There's an included project of a countdown timer.

## Room for Improvement
There is always room for improvement in any coding project as skills and possibilities for further functionality may come along.

## Contact
Feel free to contact me @michaelrjamesjr on twitter
