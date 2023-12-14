const textBox = document.getElementById("popup_question");
textBox.focus();

textBox.addEventListener("keyup", function (event) {
  // Check if the key pressed is "Enter"
  if (event.key === "Enter") {
    const enteredValue = textBox.value;
    console.log("Entered Value: " + enteredValue);
    chrome.runtime.sendMessage({ action: "jumpHosts", host: enteredValue });
  }
});
