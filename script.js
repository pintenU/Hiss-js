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
let queue = []; // kö för hissens rörelse

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

function runQueue() {
  if (isMoving || queue.length === 0) return;
 
  const next = queue.shift(); // Ta första i kön
  isMoving = true;
 
  updateDisplay("Åker till våning:", next.floor);
 
  closeDoors(() => {
    moveToFloor(next.floor, () => {
      activeFloor = next.floor;
      next.button.classList.remove("pushed");
      updateDisplay("Stannar på våning:", activeFloor);
 
      openDoors(() => {
        setTimeout(() => {
          closeDoors(() => {
            isMoving = false;
            runQueue(); // fortsätt inom kön
          });
        }, 1000);
      });
    });
  });
}
 
function addToQueue(floor, button) {
  if (floor === activeFloor && !isMoving) {
    updateDisplay("Du är redan på våning:", floor);
    return;
  }
 
  // Ifall det inte finns lägg till i kö
  const alreadyQueued = queue.some(item => item.floor === floor && item.button === button);
  if (alreadyQueued) return;
 
  queue.push({ floor, button });
  button.classList.add("pushed");
  updateDisplay("Lagt till i kön, våning:", floor);
 
  runQueue();
}
 


btnResetDisplay.addEventListener('click', () => {
  display.innerHTML = "";
})