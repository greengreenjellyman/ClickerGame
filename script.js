
const clickBtn = document.getElementById('click-btn');
const clickCount = document.getElementById('click-count');

// Load the current click count from the server or set to 0 if it doesn't exist
let totalClicks = 0;

// Connect to the WebSocket server
const socket = new WebSocket('ws://localhost:8080');

// Connect to the BroadcastChannel
const broadcastChannel = new BroadcastChannel('clickCountChannel');

// Listen for messages from the server
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);

  // Handle a message that contains the current total click count
  if (message.type === 'clickCount') {
    totalClicks = message.value;
    clickCount.textContent = totalClicks;
  }

  // Handle a message that indicates a new click has been added globally
  if (message.type === 'clickAdded') {
    totalClicks++;
    clickCount.textContent = totalClicks;
    broadcastChannel.postMessage(totalClicks);
  }
});

// Send a message to the server to request the current click count
socket.addEventListener('open', () => {
  socket.send(JSON.stringify({ type: 'getClickCount' }));
});

// Increment the click count and send a message to the server to add the click globally
function handleClick() {
  totalClicks++;
  clickCount.textContent = totalClicks;
  socket.send(JSON.stringify({ type: 'addClick' }));
  broadcastChannel.postMessage(totalClicks);
}

// Add event listener to button
clickBtn.addEventListener('click', handleClick);

// Save the current click count in localStorage
window.addEventListener('beforeunload', () => {
  localStorage.setItem('totalClicks', totalClicks);
});

// Load the click count from localStorage on page load
window.addEventListener('load', () => {
  const savedClicks = localStorage.getItem('totalClicks');

  if (savedClicks) {
    totalClicks = parseInt(savedClicks);
    clickCount.textContent = totalClicks;
  }
});

// Send the current click count to the server when the client disconnects
window.addEventListener('unload', () => {
  socket.send(JSON.stringify({ type: 'updateClickCount', value: totalClicks }));
});

// Listen for messages from other instances of the game running in other tabs/windows
broadcastChannel.addEventListener('message', event => {
  const message = event.data;

  // Update the click count with the new value
  totalClicks = message;
  clickCount.textContent = totalClicks;
});

