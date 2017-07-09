var recordButton = document.getElementById('recordToggle');
var constraints = { audio: true };

var shouldRecord = false;
var mediaRecorder = null;
var recordedMimeType = null;

if (navigator.mediaDevices && MediaRecorder) {
  if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
    recordedMimeType = 'audio/webm;codecs=opus';
  } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
    recordedMimeType = 'audio/ogg;codecs=opus';
  }
}

if (recordedMimeType === null) {
  recordButton.style.visibility = 'hidden';
} else {
  recordButton.addEventListener('click', function() {
    shouldRecord = !shouldRecord;
    if (shouldRecord) {
      navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess);
      recordButton.classList.add('purple');
    } else if (mediaRecorder) {
      mediaRecorder.stop();
      recordButton.classList.remove('purple');
    }
  });
}

function handleSuccess(stream) {
  var chunks = [];
  mediaRecorder = new MediaRecorder(stream, {mimeType: recordedMimeType});

  mediaRecorder.addEventListener('stop', function() {
    Api.sendBlobRequest(new Blob(chunks, { 'type' : recordedMimeType }));

    for (var track of stream.getTracks()) {
      track.stop();
    }
  });

  mediaRecorder.addEventListener('dataavailable', function(e) {
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  });
  
  mediaRecorder.start();
}