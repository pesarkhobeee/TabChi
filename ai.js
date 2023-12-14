/*
This file is dedicated to all the functions that are related to OpenAI section.
*/

const $sendBtn = $("#AI-send-btn");
const $userInput = $("#AI-user-input");
const $messages = $(".AI-messages");
const $downloadBtn = $("#AI-download-btn");
let conversationHistory = [];

chrome.storage.sync.get(["chat_gpt_prompt"]).then((result) => {
  if (result.chat_gpt_token) {
    promt = chat_gpt_prompt;
  } else {
    promt = "";
  }

  conversationHistory = [
    {
      role: "system",
      content: promt,
    },
  ];
});

$downloadBtn.on("click", function () {
  const fileName = "conversation.txt";
  const content = conversationHistory
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n");
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    link.remove();
  }, 0);
});

function sendMessage(message) {
  const messageElem = `<div class="message user">${message}</div>`;
  $messages.append(messageElem);
  conversationHistory.push({ role: "user", content: message });
}

function receiveMessage(message) {
  const messageElem = `<div class="message gpt">${message}</div>`;
  $messages.append(messageElem);
  conversationHistory.push({ role: "assistant", content: message });
}

// Show the AI-loading icon and disable the text box and button
function AI_showLoadingIcon() {
  $("#AI-loadingIcon")
    .removeClass("AI-loading-icon-hidden")
    .addClass("AI-loading-icon-visible");
  $("#AI-user-input").prop("disabled", true);
  $("#AI-send-btn").prop("disabled", true);
}

// Hide the AI-loading icon and enable the text box and button
function AI_hideLoadingIcon() {
  $("#AI-loadingIcon")
    .removeClass("AI-loading-icon-visible")
    .addClass("AI-loading-icon-hidden");
  $("#AI-user-input").prop("disabled", false);
  $("#AI-send-btn").prop("disabled", false);
}

$sendBtn.on("click", function () {
  const message = $userInput.val().trim();

  if (message) {
    sendMessage(message);
    $userInput.val("");

    // Show the loading icon and disable the text box and button
    AI_showLoadingIcon();

    // Use processInput function to get a response
    processInput(message)
      .then((response) => {
        // Hide the loading icon and enable the text box and button
        AI_hideLoadingIcon();

        receiveMessage(response);
      })
      .catch((error) => {
        // Hide the loading icon and enable the text box and button
        AI_hideLoadingIcon();

        console.error("Error:", error);
        receiveMessage("An error occurred. Please try again later.");
      });
  }
});

// Pressing enter to send the message
$userInput.on("keydown", function (e) {
  if (e.keyCode === 13) {
    $sendBtn.click();
  }
});

// processInput function
function processInput(textIn) {
  chrome.storage.sync.get(["chat_gpt_token"]).then((result) => {
    const apiKey = result.chat_gpt_token;
    const url = "https://api.openai.com/v1/chat/completions";

    const data = {
      model: "gpt-3.5-turbo",
      messages: conversationHistory,
      temperature: 0.3,
      max_tokens: 2000,
    };

    console.log(data);

    return new Promise((resolve, reject) => {
      $.ajax({
        url: url,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + apiKey,
        },
        data: JSON.stringify(data),
        success: function (response) {
          const chatbotResponse = response.choices[0].message.content;
          resolve(chatbotResponse);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.error("Error:", errorThrown);
          reject(errorThrown);
        },
      });
    });
  });
}
