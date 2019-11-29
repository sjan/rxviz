export default {
  'basic-button-click': {
    name: 'Button Click',
    code: `
    // This example visualizes a click stream
    const { fromEvent } = Rx;
    const { } = RxOperators;
    // see https://www.learnrxjs.io/ for complete list of Rx and RxOperators

    // Setting up button on screen
    const button = document.createElement('button');
    button.innerHTML = "CLICK ME";
    output.prepend(button);

    // Returns a source observable from button click event and rendered by RxViz
    fromEvent(button, 'click') 
    /* Click on the button to see the click stream! */
`,
    timeWindow: 10000
  },
  'button-click-flatmap-api': {
    name: 'Button Click Mapped to Api Call',
    code: `
    // This example visualizes a simulated api call triggered by a click
    const { fromEvent, of, interval, from} = Rx;
    const { flatMap, delay} = RxOperators;
    // see https://www.learnrxjs.io/ for complete list of Rx and RxOperators

    // Setting up button
    const ONE_SECOND = 1000
    const button = document.createElement('button');
    button.innerHTML = "CLICK ME";
    output.prepend(button);

    const clickStream = fromEvent(button, 'click').pipe(
      map(e => 'C') // maps each click to 'C'
    )  

    // Declare function a simulates an api call. The service returns a random number below 10 after 1 second
    function randomNumberService() { 
      return from([Math.floor(Math.random()*10)]) //random integer below 10
        .pipe(
          delay(ONE_SECOND), // simulates 1 second roundtrip
        )  
    }

    // resultStream chained from the click stream
    const resultStream =
      fromEvent(button, 'click').pipe(
        flatMap( // flatMap maps the click event to an async call to the server. This differs from map because map is synchronous and flatMap is asynchronous
          (clickEvent => randomNumberService())
        ),
      )

    of(clickStream, resultStream)
    /* Now we have a visualization for a clicks and api calls. 

    Let's say we have an impatient user that taps many times while waiting for the ui to update
    results. What happens then?*/
`,
    timeWindow: 10000
  },
  'debouncing-clicks': {
    name: 'Debouncing clicks',
    code: `// This example visualizes debouncing clicks to prevent duplicate api calls
    const { fromEvent, of, interval, from, Subject} = Rx;
    const { map, flatMap, delay, throttle, tap} = RxOperators;
    // see https://www.learnrxjs.io/ for complete list of Rx and RxOperators

    // Setting up button
    const ONE_SECOND = 1000
    const button = document.createElement('button');
    button.innerHTML = "CLICK ME";
    output.prepend(button);

    const clickStream = fromEvent(button, 'click').pipe(
      map(e => 'C')
    )  

    // Declare a function to simulate an api call. The service returns a random number below 10 after 1 second
    function randomNumberService() { 
      return from([Math.floor(Math.random()*10)]) //random integer below 10
        .pipe(
          delay(ONE_SECOND), // simulates 1 second roundtrip
        )  
    }

    // resultStream chained from the click stream
    const resultStream =
      fromEvent(button, 'click').pipe(
        throttle(() => interval(ONE_SECOND)),
        flatMap( // flatMap maps the click event to an async call to the server. This differs from map because map is synchronous and flatMap is asynchronous
          (throttledClickEvent => randomNumberService())
        ),
      )

    of(clickStream, resultStream)
    
    /* The above code will debounce/throttle the click event to only emit one api request
    in the one second window. Try double or triple clicking the button.*/    
`,
    timeWindow: 10000
  },
  'chaining-api-calls': {
    name: 'Chaining async api calls',
    code: `// This example visualizes an api call mapped from debounced clicks
    const { fromEvent, of, interval, from, Subject} = Rx;
    const { map, flatMap, delay, throttle, tap} = RxOperators;
    // see https://www.learnrxjs.io/ for complete list of Rx and RxOperators

    // Setting up button
    const ONE_SECOND = 1000
    const button = document.createElement('button');
    button.innerHTML = "CLICK ME";
    output.prepend(button);
    
    const clickStream = fromEvent(button, 'click')   
    const responseStream = new Subject() 
    
    // Declare function a simulates an api call. The service adds 1 to the input number
    function addOneService(n) { // Declare a function
      return from([n + 1])
        .pipe(
          delay(ONE_SECOND), // simulates 1 second roundtrip
          tap(result => responseStream.next(result)),              
      )  
    }
    
    // chained api response stream is chained from the click Stream and api call
    const resultStream =
      fromEvent(button, 'click').pipe(
        throttle(() => interval(ONE_SECOND)),
        flatMap( 
          (clickEvent => addOneService(0))
        ),
        flatMap( 
          (apiResult1 => addOneService(apiResult1))
        ),
        flatMap( 
          (apiResult2 => addOneService(apiResult2))
        ),              
      )
    
    of(clickStream, of(responseStream, resultStream))
    
    /* The above code will make an api call to the add service 3 times. What happens
    if there is an error?*/    
`,
    timeWindow: 10000
  },
  'error-handling-api-calls': {
    name: 'error handling in api calls',
    code: `
    // This example visualizes error handling 
    const { fromEvent, of, interval, from, Subject, BehaviorSubject} = Rx;
    const { map, flatMap, delay, throttle, tap, withLatestFrom, catchError, NEVER} = RxOperators;
    
    // Setting up buttons
    const ONE_SECOND = 1000
    const button = document.createElement('button');
    button.innerHTML = "CLICK ME";
    output.prepend(button);

    //button to simulate disconnecting from network
    const errorButton = document.createElement('button');
    errorButton.innerHTML = "Disconnect Api";
    output.prepend(errorButton);

    const errorClickStream = fromEvent(errorButton, 'click') 
    const connectionStream = new BehaviorSubject(true) 
    
    // subscription to setup error button toggle changing connection state stream
		const subscription = errorClickStream.pipe(
      withLatestFrom(connectionStream,
        (_, isCurrentlyConnected) => { 
          return !isCurrentlyConnected 
        }),
      ).subscribe(newConnectionState => connectionStream.next(newConnectionState));
      
      // subscription to setup error button text
		const errorButtonSubscription = connectionStream.subscribe(
      connected => {if(connected) {
        errorButton.innerHTML = "Disconnect Api";
      } else {
        errorButton.innerHTML = "Reconnect Api";
      }
           }
    );

 		const responseStream = new Subject() 

    // Function that a simulates an api call. The service adds one to the input number
    function addOneService(n) { // Declare a function
      return from([n + 1])
              .pipe(
                delay(ONE_SECOND), // simulates 1 second roundtrip
             	  withLatestFrom(connectionStream,
                              (result, isConnected) => { 
                	if(isConnected) {
										return result;
                  } else {
                    throw new Error('Api Error')
                  }
                }),
      )  
    }
    
    //This results stream handles the error by mapping errors to NEVER such that they are ignored
    const resultStream =
            fromEvent(button, 'click').pipe(
              throttle(() => interval(ONE_SECOND)),
              flatMap( 
                (clickEvent => addOneService(0).pipe(
                  catchError(error => NEVER) // if api call returns error, ignore and
                ))
              ),
            )
    
    const clickStream = fromEvent(button, 'click').pipe(
    	map(e => 'C')
    )

    of(clickStream, resultStream)   
`,
    timeWindow: 10000
  },
  'takeunil-stopping-api-stream': {
    name: 'Stopping an Api Response',
    code: `// This example visualizes the use of an event to stopping a stream
const { fromEvent, of, interval, from} = Rx;
const { map, flatMap, delay, throttle, takeUntil} = RxOperators;

// Setting up buttons
const ONE_SECOND = 1000
const button = document.createElement('button');
const stopButton = document.createElement('button');
button.innerHTML = "CLICK ME";
stopButton.innerHTML = "STOP";
output.prepend(button);
output.prepend(stopButton);

const clickStream = fromEvent(button, 'click') // Creates source observable from button click
	.pipe(   // pipe is specific to JS. other languages may have other notiations.
    map(e => 'C') // maps each click to 'C' just for visual clarity
  )

const stopEvent = fromEvent(stopButton, 'click')

const simulatedApiCall = from('R')
	.pipe(
    delay(ONE_SECOND), // simulates api 1 second roundtrip
	)

// api response stream is chained from the click Stream
const responseStream =
      clickStream.pipe(
        throttle(() => interval(ONE_SECOND)), // 'throttle' takes the first event ignores the others in a time window
        flatMap( // flatMap maps the click event to an async call to the server
          (clickEvent => simulatedApiCall)
        ),
        takeUntil(stopEvent) // take Api response until the stop event is triggered
			)

of(clickStream, responseStream)
/* Try clicking on stop while a request has not returned. See the api stream conclude! */
`,
    timeWindow: 10000
  },
  custom: {
    name: 'Custom',
    code: `// Write any JavaScript you want, just make sure that
// the last expression is an Rx.Observable

const {  } = Rx;
const {  } = RxOperators;
 `,
    timeWindow: 10000
  }
};
