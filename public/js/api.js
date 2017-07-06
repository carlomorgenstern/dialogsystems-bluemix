// The Api module is designed to handle all interactions with the server

var Api = (function() {
  var requestPayload;
  var responsePayload;
  var sttPayload;
  var endpoints = {
    message: '/api/message',
    speechin: '/api/speechin',
    speechout: '/api/speechout'
  };

  var audioContext = new AudioContext();
  var shouldSpeak = true;
  var speechButton = document.getElementById('speechToggle');
  speechButton.addEventListener('click', function() {
    shouldSpeak = !shouldSpeak;
    if (shouldSpeak) {
      speechButton.children[0].classList.remove('glyphicon-volume-off');
      speechButton.children[0].classList.add('glyphicon-volume-up');
    } else {
      speechButton.children[0].classList.remove('glyphicon-volume-up');
      speechButton.children[0].classList.add('glyphicon-volume-off');
    }
  });

  // Publicly accessible methods defined
  return {
    sendRequest: sendRequest,
    sendBlobRequest: sendBlobRequest,

    // The request/response getters/setters are defined here to prevent internal methods
    // from calling the methods without any of the callbacks that are added elsewhere.
    getRequestPayload: function() {
      return requestPayload;
    },
    setRequestPayload: function(newPayloadStr) {
      requestPayload = JSON.parse(newPayloadStr);
    },
    getResponsePayload: function() {
      return responsePayload;
    },
    setResponsePayload: function(newPayloadStr) {
      responsePayload = JSON.parse(newPayloadStr);
    },
    getSttPayload: function() {
      return sttPayload;
    },
    setSttPayload: function(newPayloadStr) {
      sttPayload = JSON.parse(newPayloadStr);
    }
  };

  // Send a message request to the server
  function sendRequest(text, context, endpoint) {
    // Build request payload
    var payloadToWatson = {};
    if (text) {
      payloadToWatson.input = {
        text: text
      };
    }
    if (context) {
      payloadToWatson.context = context;
    }

    // Built http request
    var http = new XMLHttpRequest();
    http.open('POST', endpoints[endpoint], true);
    http.setRequestHeader('Content-type', 'application/json');
    http.onload = function() {
      if (endpoint === 'message') {
        Api.setResponsePayload(http.responseText);
        if (shouldSpeak) {
          sendRequest(JSON.parse(http.responseText).output.text.join(''), null, 'speechout');
        }
      } else if (endpoint === 'speechout') {
        playSpeech(http.response);
      }
    };

    var params = JSON.stringify(payloadToWatson);
    if (endpoint === 'message') {
      // Stored in variable (publicly visible through Api.getRequestPayload)
      // to be used throughout the application
      if (Object.getOwnPropertyNames(payloadToWatson).length !== 0) {
        Api.setRequestPayload(params);
      }
    } else {
      http.responseType = 'arraybuffer';
    }

    // Send request
    http.send(params);
  }

  // Send a blob request to the server
  function sendBlobRequest(blob) {
    var formData = new FormData();
    formData.append('speech', blob);

    var http = new XMLHttpRequest();
    http.open('POST', endpoints.speechin);
    http.onreadystatechange = function() {
      if (http.readyState === 4 && http.status === 200 && http.responseText) {
        Api.setSttPayload(http.responseText);
      }
    };

    http.send(formData);
  }

  function playSpeech(response) {
    audioContext.decodeAudioData(response, function(buffer) {
      var source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start(0);
    });
  }
}());
