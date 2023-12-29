import './style.css'

const drawer = document.getElementById("drawer");
const fileInput = document.getElementById("fileInput");
const tuckBtn = document.getElementById("tuckBtn");
const nowBtn = document.getElementById("nowBtn");
const mainImg = document.getElementById("mainImg");
const noneMsg = document.getElementById("noneMsg");
const startBtn = document.getElementById("startBtn");

const storedImg = localStorage.getItem("imgSrc")
if (storedImg) {
  noneMsg.style.display = "none";
  mainImg.src = storedImg;
}


tuckBtn.addEventListener("click", () => {
  tuckBtn.classList.toggle("tucked");
  drawer.classList.toggle("tucked");
})

startBtn.addEventListener("click", () => {
  tuckBtn.classList.toggle("tucked");
  drawer.classList.toggle("tucked");
})



nowBtn.addEventListener("click", async () => {
  const regs = await navigator.serviceWorker.getRegistrations();
  const reg = regs[0]

  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  } else if (Notification.permission === "granted") {
    // Check whether notification permissions have already been granted;
    // if so, create a notification
    notify(reg);
  } else if (Notification.permission !== "denied") {
    // We need to ask the user for permission
    Notification.requestPermission().then((permission) => {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        notify(reg);
      }
    });
  }
})

function notify(reg) {
  reg?.showNotification("See My Badge", {
    body: "Click to see my badge",
    // requireInteraction: true,
    // renotify: true,
    // tag: "badge"
  });
  // const notification = new Notification(
  //   "See My Badge",
  //   {
  //     body: "Click to see my badge",
  //     // requireInteraction: true,
  //     // renotify: true,
  //     // tag: "badge"
  //   });

  // return notification
}

fileInput.addEventListener("change", e => {
  const file = fileInput.files[0]
  // mainImg.src = URL.createObjectURL(file);

  if (!file) return;
  let reader = new FileReader();
  reader.onload = function (e) {
    const data = e.target.result;
    mainImg.src = data;
    mainImg.onload = () => {
      localStorage.setItem("imgSrc", data);
      noneMsg.style.display = "none";
    }
  }
  reader.readAsDataURL(file);
})
