(function(){
const qp = new URLSearchParams(window.location.search)
if (qp.has("coins")) {
  const ncoins = parseInt(qp.get("coins"))
  if (ncoins == 6) {
    document.querySelector("body").insertAdjacentHTML('afterbegin', '<p class="congrats">🎉 Congrats on finding all 6 coins!</p>')
  } else if (ncoins > 6) {
    document.querySelector("body").insertAdjacentHTML('afterbegin', '<p class="congrats">🎉 Congrats on being a dirty cheater and/or finding a bug. There are only supposed to be 6 coins! 😂</p>')
  }
}

(document.querySelector("#showlevelselect")).onclick = (evt) => {
  document.querySelector(".levelselect ul").classList.toggle("d-none")
}

})();
