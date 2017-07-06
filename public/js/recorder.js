const recordButton = document.getElementById('recordToggle');
const constraints = { audio: true };

let shouldRecord = false;
var mediaRecorder = null;

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

function handleSuccess(stream) {
  let chunks = [];
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.addEventListener('stop', function(e) {
    Api.sendBlobRequest(new Blob(chunks, { 'type' : 'audio/webm;codecs=opus' }));
  });

  mediaRecorder.addEventListener('dataavailable', function(e) {
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  });
  
  mediaRecorder.start();
}