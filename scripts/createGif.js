const videoCtn = document.getElementById("video-ctn");
const videoCtnContents = Array.from(videoCtn.children).splice(4, 3);
const video = videoCtnContents[2];
const steps = document.querySelectorAll(".step-number");
const confirmBtn = document.getElementById("confirm-btn");
const
  let currentStep = 0;

confirmBtn.addEventListener("click", recordNextStep);

function recordNextStep() {
  switch (currentStep) {
    case (0): //El usuario ha presionado en "Comenzar".
      confirmBtn.classList.add("hidden");
      steps[0].classList.add("current-step");
      videoCtnContents[0].classList.add("hidden");
      videoCtnContents[1].classList.remove("hidden");
      currentStep++;
      getVideo();
      return;
    case (1): //El usuario aceptó el permiso de la cámara. 
      confirmBtn.textContent = "Grabar";
      confirmBtn.classList.remove("hidden");
      steps[0].classList.remove("current-step");
      steps[1].classList.add("current-step");
      videoCtnContents[1].classList.add("hidden");
      videoCtnContents[2].classList.remove("hidden");
      currentStep++;
      return;
    case (2): //El usuario presionó en "Grabar".
      confirmBtn.textContent = "Finalizar";
      //1. Comenzar la grabación.
      //2. Mostrar el time counter.
      currentStep++;
      return;
    case (3): //El usuario presionó en "Finalizar".
      confirmBtn.textContent = "Subir Gifo";
      //1. Detener la grabación.
      //2. Remplazar el time counter por el botón de reiniciar.
      currentStep++;
      return;
    case (4): //El usuario presionó "Subir Gifo".
      confirmBtn.classList.add("hidden");
      steps[1].classList.remove("current-step");
      steps[2].classList.add("current-step");
      //1. Mostrar el cargando y el filter violeta.
      //2. Subir gif a Giphy.
      //3. Mostrar el "subido" y los botoncitos en la esquinita.
      //3. Agregar el id del gif a la lista de mis gifos.
      return;
  }
}







function getVideo() {
  navigator.getUserMedia = (navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia);
  navigator.getUserMedia(

    // constraints
    {
      video: true,
      audio: false
    },

    // successCallback
    function (localMediaStream) {

      video.srcObject = localMediaStream;
      recordNextStep();
    },

    // errorCallback
    function (err) {
      console.log("Ocurrió el siguiente error: " + err);
    }

  );
}
