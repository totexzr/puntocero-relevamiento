/*
  PUNTOCERO - formulario dinámico
  IMPORTANTE: pegá la URL de tu Web App de Google Apps Script en API_URL.
*/
const API_URL = "PEGAR_AQUI_LA_URL_DE_TU_WEB_APP";

const steps = [...document.querySelectorAll(".step")];
const progressBar = document.getElementById("progressBar");
const stepText = document.getElementById("stepText");
const progressPercent = document.getElementById("progressPercent");
const form = document.getElementById("surveyForm");
const message = document.getElementById("message");
let currentStep = 0;

function showStep(index){
  currentStep = index;
  steps.forEach((s,i)=>s.classList.toggle("active",i===index));
  const pct = Math.round(((index+1)/steps.length)*100);
  progressBar.style.width = pct + "%";
  stepText.textContent = `Paso ${index+1} de ${steps.length}`;
  progressPercent.textContent = pct + "%";
  window.scrollTo({top:0,behavior:"smooth"});
}

function validateStep(index){
  const fields = steps[index].querySelectorAll("input,select,textarea");
  for(const field of fields){
    if(!field.checkValidity()){
      field.reportValidity();
      return false;
    }
  }
  return true;
}

document.querySelectorAll(".next").forEach(btn=>{
  btn.addEventListener("click",()=>{
    if(validateStep(currentStep) && currentStep < steps.length-1){
      showStep(currentStep+1);
    }
  });
});

document.querySelectorAll(".prev").forEach(btn=>{
  btn.addEventListener("click",()=>{
    if(currentStep>0) showStep(currentStep-1);
  });
});

// Propiedad "Otro"
document.getElementById("propiedad").addEventListener("change", e=>{
  document.getElementById("otroPropiedadWrap").classList.toggle("hidden",e.target.value!=="Otro");
});

// Lógica Starlink
document.querySelectorAll('input[name="internet"]').forEach(r=>{
  r.addEventListener("change",()=>{
    const show = r.checked &&
      (r.value.includes("inestable") || r.value.includes("No, no tengo"));
    document.getElementById("starlinkWrap").classList.toggle("hidden",!show);

    if(!show){
      document.querySelectorAll('input[name="starlink"]').forEach(x=>x.checked=false);
    }
  });
});

function getRadio(name){
  return document.querySelector(`input[name="${name}"]:checked`)?.value || "";
}

function getChecks(name){
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(x=>x.value);
}

function collectData(){
  return {
    fecha: new Date().toLocaleString("es-AR"),
    nombre: document.getElementById("nombre").value.trim(),
    telefono: document.getElementById("telefono").value.trim(),
    localidad: document.getElementById("localidad").value.trim(),
    propiedad: document.getElementById("propiedad").value,
    otroPropiedad: document.getElementById("otroPropiedad").value.trim(),
    internet: getRadio("internet"),
    starlink: getRadio("starlink"),
    alarma: getRadio("alarma"),
    camaras: document.getElementById("camaras").value,
    zonas: document.getElementById("zonas").value.trim(),
    vision: getChecks("vision").join(" | "),
    almacenamiento: getRadio("almacenamiento"),
    urgencia: getRadio("urgencia"),
    observaciones: document.getElementById("observaciones").value.trim()
  };
}

form.addEventListener("submit", async e=>{
  e.preventDefault();

  if(!validateStep(currentStep)) return;

  if(API_URL.includes("PEGAR_AQUI")){
    showMessage("El formulario todavía no está conectado. Primero configurá la URL de Google Apps Script en script.js.", false);
    return;
  }

  const btn = document.getElementById("submitBtn");
  btn.disabled = true;
  btn.textContent = "Enviando...";

  const data = collectData();

  try{
    /*
      no-cors se usa porque Google Apps Script puede responder mediante una redirección.
      El navegador no permite leer la respuesta, pero la petición POST sí llega al Web App.
    */
    await fetch(API_URL,{
      method:"POST",
      mode:"no-cors",
      headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"},
      body:new URLSearchParams(data).toString()
    });

    form.innerHTML = `
      <div class="message success">
        <h3>✅ ¡Relevamiento enviado!</h3>
        <p>Recibimos correctamente tus datos. El equipo de <strong>PUNTOCERO</strong> los analizará y se pondrá en contacto con vos por WhatsApp.</p>
        <p>Si necesitás atención inmediata, podés escribirnos directamente.</p>
        <a class="btn primary" style="display:inline-block;text-decoration:none;margin-top:8px"
           href="https://wa.me/549XXXXXXXXXX" target="_blank" rel="noopener">
           💬 Hablar con PUNTOCERO por WhatsApp
        </a>
      </div>
    `;
    window.scrollTo({top:0,behavior:"smooth"});
  }catch(error){
    console.error(error);
    showMessage("No pudimos enviar el relevamiento. Verificá tu conexión e intentá nuevamente.", false);
    btn.disabled=false;
    btn.textContent="📩 Enviar relevamiento";
  }
});

function showMessage(text,success){
  message.textContent=text;
  message.classList.remove("hidden","success","error");
  message.classList.add(success?"success":"error");
}
