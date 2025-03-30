let targetWindow = null;

// Open or focus the target window
if (!targetWindow || targetWindow.closed) {
  targetWindow = window.open("http://localhost:5000/TrackerBase", "_blank");
}

function sendMessage(type, details) {
  if (targetWindow) {
    const message = {
      type,
      timestamp: Date.now(),
      userId: "user-123",
      details,
    };
    targetWindow.postMessage(JSON.stringify(message), "http://localhost:5000/TrackerBase");
  } else {
    console.error("Target window is null or blocked by a popup blocker.");
  }
}

document.getElementById("messageid").addEventListener("click", () => {
  sendMessage("button-click", {
    button: "left",
    x: event.clientX,
    y: event.clientY,
  });
});

document.getElementsByTagName("button")[1].addEventListener("click", () => {
  sendMessage("button-click", {
    button: "left",
    x: event.clientX,
    y: event.clientY,
  });
});

document.addEventListener("mousemove", (event) => {
  sendMessage("cursor-move", {
    x: event.pageX,
    y: event.pageY,
  });
});

document.addEventListener("scroll", (event) => {
  sendMessage("scroll", {
    deltaY: window.scrollY,
    deltaX: window.scrollX,
  });
});

document.querySelectorAll(".trackable-element").forEach((element) => {
  element.addEventListener("mouseenter", () => {
    sendMessage("mouse-enter", {
      elementId: element.id,
      x: event.clientX,
      y: event.clientY,
    });
  });

  element.addEventListener("mouseleave", () => {
    sendMessage("mouse-leave", {
      elementId: element.id,
      x: event.clientX,
      y: event.clientY,
    });
  });
});


document.addEventListener("dblclick", (event) => {
  sendMessage("double-click", {
    x: event.clientX,
    y: event.clientY,
  });
});

document.addEventListener("keypress", (event) => {
  sendMessage("keypress", {
    key: event.key,
    code: event.code,
  });
});