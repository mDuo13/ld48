const SQSIZE = 48 // px
const BARW = 200 // px
const BOUNCE = 3 // px

const F_UP = 0
const F_LEFT = 270
const F_DOWN = 180
const F_RIGHT = 90
let GRIDMAX;

const I_UP = 1
const I_LEFT = 2
const I_DOWN = 3
const I_RIGHT = 4
const I_INTERACT = 5

const REACT_TEMP_UP = 2
const TEMP_DIVIDER = 1/4

function $$(selector) {
  return document.querySelectorAll(selector)
}
function $(selector) {
  return document.querySelector(selector)
}

function randint(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function moveTo(el, x, y) { // absolute move
  if (typeof x == "string") x = parseInt(x)
  if (typeof y == "string") y = parseInt(y)
  if (x > GRIDMAX || y > GRIDMAX || x < 0 || y < 0) return
  el.style.left = `${SQSIZE * x}px`
  el.style.top = `${SQSIZE * y}px`
  el.dataset.x = x
  el.dataset.y = y
}

function move(el, dx, dy) { // relative, unconditional move
  let x = parseInt(el.dataset.x) + dx
  let y = parseInt(el.dataset.y) + dy
  moveTo(el, x, y)
}

function facing(el) {
  if (el.dataset.facing === undefined) return F_UP
  return parseInt(el.dataset.facing)
}

function coordsFaced() {
  const p1 = $("#player")
  let x = parseInt(p1.dataset.x)
  let y = parseInt(p1.dataset.y)
  switch(facing(p1)) {
    case F_UP:
      return [x, y-1]
      break
    case F_LEFT:
      return [x-1, y]
      break
    case F_DOWN:
      return [x, y+1]
      break
    case F_RIGHT:
      return [x+1, y]
      break
  }
}

function face(el, rot) {
  let fadj;
  if (el.dataset.facingadj === undefined) fadj = F_UP
  else fadj = el.dataset.facingadj

  el.style.rotate = `${rot + fadj}deg`
  el.dataset.facing = rot
}

function tryMove(el, dx, dy) {
  let x = parseInt(el.dataset.x) + dx
  let y = parseInt(el.dataset.y) + dy
  let blocked = false
  let objs_at = $$(`.map i[data-x="${x}"][data-y="${y}"]`)
  for (o of objs_at) {
    if (o.dataset.blocking) {
      blocked = true
      break
    }
  }
  if (!blocked) {
    move(el, dx, dy)
    return true
  }
  return false
}

function sizebar(el, fr) {
  fr = parseFloat(fr)
  // if (fr === NaN) return
  el.dataset.val = fr
  let width = Math.max((fr * BARW)-BOUNCE, 0)
  el.querySelector("span").style.width = `${width}px`
}

function reactLinear(axis, da) {
  const p1 = $("#player")
  const a0 = parseInt(p1.dataset[axis])
  const b_axis = (axis=="x" ? "y": "x")
  const b = parseInt(p1.dataset[b_axis])

  let str = 0
  for (let a = a0; a>=0 && a <= GRIDMAX; a+=da) {
    let objs_found = $$(`.map i[data-reacts][data-${axis}="${a}"][data-${b_axis}="${b}"]`).length
    if (objs_found) str += (1 / (Math.abs(a0 - a)+.1))
  }
  return str
}

function orthagonalArea(r) {
  return 2*(r**2) + 2*r + 1
}

function reactArea(r) {
  const p1 = $("#player")
  const x0 = parseInt(p1.dataset.x)
  const y0 = parseInt(p1.dataset.y)
  const oa = orthagonalArea(r)
  let str = 0
  for (let x = x0 - r; x <= x0 + r; x++) {
    for (let y = y0 - r; y <= y0 + r; y++) {
      let dist = Math.abs(x0-x)+Math.abs(y0-y)
      if (dist > r) {continue}
      let objs_found = $$(`.map i[data-reacts][data-x="${x}"][data-y="${y}"]`).length
      // if (objs_found) str += ((r-dist)/(r))// * (1/oa)
      if (objs_found) str += (1 - (dist)/r) * (TEMP_DIVIDER * r)
    }
  }
  return str
}

function update_str() {
  const p1 = $("#player")
  const hud_str = $("#hud_str")
  const hud_temp = $("#hud_temp")

  if (hud_str) {
    let str;
    // Figure out distance to... stuff
    switch(facing(p1)) {
      case F_UP:
        str = reactLinear("y", -1)
        break
      case F_LEFT:
        str = reactLinear("x", -1)
        break
      case F_DOWN:
        str = reactLinear("y", 1)
        break
      case F_RIGHT:
        str = reactLinear("x", 1)
        break
    }
    sizebar(hud_str, Math.min(str, 1))
  }

  if (hud_temp) {
    let buffs = $$(`#hud_inv i[data-reacts="${REACT_TEMP_UP}"]`).length
    sizebar(hud_temp, Math.min(reactArea(buffs+1), 1))
  }
}

function collect(o) {
  const inv = $("#hud_inv")
  o.style.left = `${GRIDMAX * SQSIZE + SQSIZE}px`
  o.style.top = 0
  // remove coords so it doesn't, say, automove
  o.dataset.x = undefined
  o.dataset.y = undefined
  setTimeout(() => {
    o.remove()
    inv.appendChild(o)
    update_str()
  }, 200)
}

function clear(o) {
  const overlay = $(".overlay")
  overlay.style["z-index"] = 5
  overlay.style["z-index"] = 5
  overlay.style["opacity"] = 100
  setTimeout(() => {
    window.location = o.dataset.next
  }, 1000)
}

function read(o) {
  let tb = document.createElement("p")
  tb.classList.add("textbox")
  tb.textContent = o.dataset.msg
  let lbl = document.createElement("label")
  lbl.textContent = o.dataset.name ? o.dataset.name : "Message"
  tb.appendChild(lbl)
  $(".hud").appendChild(tb)
}

function revealHudItem(name) {
  const hi = $(`#hud_${name}`)
  if (hi) {
    hi.classList.remove("invis")
  }
}

function tryOpen(o) {
  const keys = $$(`#hud_inv i[data-key_power]`)
  let total_power = 0
  for (k of keys) {
    total_power += parseInt(k.dataset.key_power)
  }
  if (total_power >= parseInt(o.dataset.lock_threshold)) {
    let repl_o = $(`#${o.dataset.unlocks}`)
    if (!repl_o) return false
    moveTo(repl_o, o.dataset.x, o.dataset.y)
    repl_o.classList.remove("d-none")
    o.remove()
    return true
  } else return false
}

function handleInteract(o) {
  if (o.classList.contains("d-none")) {
    // reveal only
    o.classList.remove("d-none")
    return true
  }

  if (o.dataset.interact == "collect") {
    collect(o)
    return true
  }
  if (o.dataset.interact == "read") {
    read(o)
    if (o.dataset.revealhud) revealHudItem(o.dataset.revealhud)
    return true
  }
  if (o.dataset.interact == "clear") {
    clear(o)
    return true
  }
  if (o.dataset.interact == "open") {
    if (tryOpen(o)) return true
  }
  return false
}

function interact() {
  const p1 = $("#player")
  let objs_here = $$(`.map i[data-x="${p1.dataset.x}"][data-y="${p1.dataset.y}"]`)
  for (let o of objs_here) {
    let handled = handleInteract(o)
    if (handled) return
  }
  let [fx,fy] = coordsFaced()
  let obs_forward = $$(`.map i[data-x="${fx}"][data-y="${fy}"]`)
  for (let o of obs_forward) {
    let handled = handleInteract(o)
    if (handled) return
  }
}

function automoveObj(o, axis) {
  let path = JSON.parse(o.dataset[`move_${axis}`]) // assume 2-length array
  // Continue moving same direction if possible
  if (!o.dataset[`d${axis}`]) o.dataset[`d${axis}`] = 1
  let da = parseInt(o.dataset[`d${axis}`])
  let a = parseInt(o.dataset[axis])
  let dx;
  let dy;
  if (axis == "x") {
    dx = da
    dy = 0
  } else {
    dx = 0
    dy = da
  }
  let did_move = tryMove(o, dx, dy)
  a = parseInt(o.dataset[axis]) // post-move value
  if (a == path[0] || a == path[1]) { // edge of path, turn around
    da = -da
    o.dataset[`d${axis}`] = da
  }
  // TODO: maybe turn around if bump into something?
}

function move_npcs() {
  let moving_x = $$(`i[data-move_x]`)
  for (o of moving_x) {
    automoveObj(o, "x")
  }
  let moving_y = $$(`i[data-move_y]`)
  for (o of moving_y) {
    automoveObj(o, "y")
  }
}

function handleInput(input) {
  let tbs = $$(".textbox")
  if (tbs.length) {
    // Dismiss existing text box
    tbs.forEach((tb) => {tb.remove()})
    return
  }

  // Player movement
  const p1 = $("#player")
  switch(input) {
    case I_UP:
      if (facing(p1) === F_UP) tryMove(p1, 0, -1)
      else face(p1, F_UP)
      break
    case I_LEFT:
      if (facing(p1) === F_LEFT) tryMove(p1, -1, 0)
      else face(p1, F_LEFT)
      break
    case I_DOWN:
      if (facing(p1) === F_DOWN) tryMove(p1, 0, 1)
      else face(p1, F_DOWN)
      break
    case I_RIGHT:
      if (facing(p1) === F_RIGHT) tryMove(p1, 1, 0)
      else face(p1, F_RIGHT)
      break
    case I_INTERACT:
      interact()
      break
  }

  // Move NPCs
  move_npcs()

  // Update dowsing status(es)
  update_str()
}

function startup() {
  GRIDMAX = $("body").dataset.gridsize - 1
  // Init object positions and facings
  $$('.map i[data-x="-1"][data-y="-1"]').forEach(o => {
    do {
      o.dataset.x = randint(0,GRIDMAX)
      o.dataset.y = randint(0,GRIDMAX)
      // console.debug(o.id,"location:", o.dataset.x, o.dataset.y)
    } while ($$(`i[data-x="${o.dataset.x}"][data-y="${o.dataset.y}"]`).length > 1)

  })
  $$("i").forEach(o => {
    moveTo(o, o.dataset.x, o.dataset.y)
    face(o, facing(o))
  })
  $$(".hud .bar").forEach(o => {
    sizebar(o, o.dataset.val)
  })
  update_str()

  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case "w":
      case "ArrowUp":
        handleInput(I_UP)
        break
      case "a":
      case "ArrowLeft":
        handleInput(I_LEFT)
        break
      case "s":
      case "ArrowDown":
        handleInput(I_DOWN)
        break
      case "d":
      case "ArrowRight":
        handleInput(I_RIGHT)
        break
      case " ":
      case "Enter":
        handleInput(I_INTERACT)
        break
    }
  })

  $("#key_up").addEventListener('click', () => {
    handleInput(I_UP)
  })
  $("#key_left").addEventListener('click', () => {
    handleInput(I_LEFT)
  })
  $("#key_down").addEventListener('click', () => {
    handleInput(I_DOWN)
  })
  $("#key_right").addEventListener('click', () => {
    handleInput(I_RIGHT)
  })
  $("#key_interact").addEventListener('click', () => {
    handleInput(I_INTERACT)
  })
}

if (document.readyState != "loading") startup();
else document.addEventListener("DOMContentLoaded", startup);
