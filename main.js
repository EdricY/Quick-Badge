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



nowBtn.addEventListener("click", () => {
  Notification.requestPermission().then((permission) => {
    const notification = new Notification("See My Badge", { body: "Click to see my badge", icon: mainImg });
    // if (permission === "granted") {}
  });
})

fileInput.addEventListener("change", e => {
  const file = fileInput.files[0]
  mainImg.src = URL.createObjectURL(file);
  mainImg.addEventListener("load", () => {

    localStorage.setItem("imgSrc", getBase64Image(mainImg))
  }, { once: true })
})


function getBase64Image(img) {
  let canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;

  let ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  let dataURL = canvas.toDataURL("image/png");
  return dataURL;
  // return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}
