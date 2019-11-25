export default {
  'basic-button-click': {
    name: 'Button Click',
    code: `// This example visualizes a basic button click stream
const { fromEvent } = Rx;
const { map } = RxOperators;

// Setting up button
const button = document.createElement('button');
button.innerHTML = "CLICK ME";
output.prepend(button);

fromEvent(button, 'click') // Creates source observable from button click
	.pipe(   // pipe is specific to JS. other languages have other notiations
    map(e => 'C') // maps each click to 'C' just for visual clarity
  )
/* Now that we have an input stream, we can chain it to something useful like
an api call */
`,
    timeWindow: 10000
  },
  'basic-button-click-trigger-api': {
    name: 'Button Click Api Call',
    code: `// This example visualizes a button triggering an api call
const { fromEvent, of, interval, from} = Rx;
const { map, flatMap, delay} = RxOperators;

// Setting up button
const ONE_SECOND = 1000
const button = document.createElement('button');
button.innerHTML = "CLICK ME";
output.prepend(button);

const clickStream = fromEvent(button, 'click') // Creates source observable from button click
	.pipe(   // pipe is specific to JS. other languages may have other notiations.
    map(e => 'C') // maps each click to 'C' just for visual clarity
  )

const simulatedApiCall = from('R')
	.pipe(
    delay(ONE_SECOND), // simulates api 1 second roundtrip
	)

// api response stream is chained from the click Stream
const responseStream =
      clickStream.pipe(
        flatMap( // flatMap maps the click event to an async call to the server
          (clickEvent => simulatedApiCall)
        ),
			)

of(clickStream, responseStream)
/* Great. now we have a visualization for a clicks triggering api calls. Let's
say we have an impatient user that constantly taps while waiting for the api
results. What happens if the user double or triple taps?*/
`,
    timeWindow: 10000
  },
  'throttled-button-click-trigger-api': {
    name: 'Button Click Api Call, Debounced',
    code: `// This example visualizes debouncing button clicks that trigger an api call
const { fromEvent, of, interval, from} = Rx;
const { map, flatMap, delay, throttle} = RxOperators;

// Setting up button
const ONE_SECOND = 1000
const button = document.createElement('button');
button.innerHTML = "CLICK ME";
output.prepend(button);

const clickStream = fromEvent(button, 'click') // Creates source observable from button click
	.pipe(   // pipe is specific to JS. other languages may have other notiations.
    map(e => 'C') // maps each click to 'C' just for visual clarity
  )

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
			)

of(clickStream, responseStream)
/* By adding a throttle to the chain we've resolve the 'impatient user problem'
 with one line, and zero state management! Try double or triple clicking */
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
