const elevator = document.getElementById('elevator');
const buttons = document.querySelectorAll('[data-floor]');
const btnResetDisplay = document.getElementById('btn-reset-display');
const display = document.querySelector('.elevator-display');
const leftDoor = document.querySelector('.door-left');
const rightDoor = document.querySelector('.door-right');

const totalFloors = 10;
const floorHeight = 50;
let activeFloor = 1;
let isMoving = false; // Prevent overlapping actions
let direction = null; // up eller ner för hiss logiken
let innerbutton = []; // knapparna inom hissen
let outerbutton = []; // knapparna för varje våning


// Function to move the elevator
function moveToFloor(floor, callback) {
  const targetPosition = (floor - 1) * floorHeight;
  elevator.style.transition = "transform 2s ease-in-out";
  elevator.style.transform = `translateY(-${targetPosition}px)`; // Move the elevator
  setTimeout(callback, 2000); // Call the callback after the elevator finishes moving
}

// Function to update the display
function updateDisplay(message, floor = "") {
  display.innerHTML = `${message} ${floor}<br>` + display.innerHTML;
}

// Function to close the doors
function closeDoors(callback) {
  leftDoor.classList.remove("open");
  rightDoor.classList.remove("open");
  setTimeout(callback, 1000); // Wait for the door closing animation to complete
}

// Function to open the doors
function openDoors(callback) {
  leftDoor.classList.add("open");
  rightDoor.classList.add("open");
  setTimeout(callback, 1000); // Wait for the door opening animation to complete
}

// SCAN algoritm för att bestämma ordningen av stopp
function getNextStop() { 
  let candidates = [];

  innerQueue.forEach(floor => candidates.push({ floor, source: "inner", dir: null })); // Knapparna inom hissen på hisskonsolen

  outerQueue.forEach(req => {
    if (direction === null || req.dir === direction) {
      candidates.push({ floor: req.floor, source: "outer", dir: req.dir }); // Knapparna utanför hissarna, används bara om det är i rätt riktning
    }
  });

  if (direction === "down") {
    candidates = candidates.filter(c => c.floor < activeFloor);
    candidates.sort((a, b) => b.floor - a.floor);  // bestämmer ifall det finns ett stop påväg ner
  } else {
    
    candidates = candidates.filter(c => c.floor > activeFloor);
    candidates.sort((a, b) => a.floor - b.floor);  // istället för när hissen åker upp
  }

  if (candidates.length > 0) return candidates[0]; 

// Kollar ifall det finns något efter stopp, åker i dens riktning ifall det finns
  if (outerQueue.length > 0 || innerQueue.length > 0) {
    direction = direction === "up" ? "down" : "up";
    return getNextStop();
  }

  return null; 
}

// Tar bort våning ifall den har nått fram
function removeFromQueue(floor, source, dir) {
  if (source === "inner") {
    innerQueue = innerQueue.filter(f => f !== floor);
  } else {
    outerQueue = outerQueue.filter(r => !(r.floor === floor && r.dir === dir));
  }
  clearButtonHighlight(floor, source, dir);
}

buttons.forEach(button => {
  button.addEventListener("click", () => {
    const floor = parseInt(button.getAttribute("data-floor"));

    // Proceed if it's a valid floor, different from the current, and no movement is in progress
    if (floor >= 1 && floor <= totalFloors && floor !== activeFloor && !isMoving) {
      isMoving = true; // Lock actions while moving
      button.classList.add('pushed');
      updateDisplay("Åker till våning:", floor);

      closeDoors(() => {    
        moveToFloor(floor, () => {
          updateDisplay("Du är på våning:", floor);
          activeFloor = floor; // Update current floor
          openDoors(() => {
            button.classList.remove('pushed');
            isMoving = false; // Unlock actions after moving
          });
        });
      });

    } else if (floor === activeFloor) {
      updateDisplay("Du är redan på våning:", floor);

    } else if (isMoving) {
      updateDisplay("Hissen rör sig, vänligen vänta.");

    } else {
      updateDisplay("Ogiltig våning:", floor);
    }
  });
});

btnResetDisplay.addEventListener('click', () => {
  display.innerHTML = "";
})