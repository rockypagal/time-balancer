const insetValue = ({ id, value }) => {
  document.getElementById(id).innerHTML = value;
};

const showMore = document.getElementById("show-more");
showMore.addEventListener("click", (e) => {
  e.target.classList.toggle("red-color");
  const features = document.getElementById("extra-feature");
  features.classList.toggle("show-extra-feature");
});

const date = document.getElementById("skip-input");
const skipTimeBox = document.getElementById("skip-time");
function getSkipDates() {
  const arr = skipTimeBox.children;
  if (arr.length === 0) return false;
  const newDates = [];
  for (let i = 0; i < arr.length; i++) {
    newDates.push(arr[i]?.innerText);
  }
  return newDates;
}


date.addEventListener("change", (e) => {
  const formattedDate = new Date(e.target.value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  skipTimeBox.innerHTML =
    skipTimeBox.innerHTML +
    `<h2
        class="heading-h2"
        id="time-balance-ext-098-6"
        style="text-transform: uppercase; text-align:right;font-size:14px;"
      >
        ${formattedDate}
      </h2>`;
});

const checkTimeInputValidValue = (timeInputValue) => {
  return timeInputValue?.length > 1
    ? Number(timeInputValue[0]) > 12
      ? `${Number(timeInputValue[0]) - 12}:${timeInputValue[1]} PM`
      : `${timeInputValue[0]}:${timeInputValue[1]} AM`
    : false;
};

document.getElementById("calculate").addEventListener("click", async () => {
  const skipDatesArr = getSkipDates();
  const timeInputValue = await document
    .getElementById("time-input")
    .value.split(":");
  if (document.getElementById("time-balance-ext-098-1").innerHTML !== "") {
    document.getElementById("time-balance-ext-098-1").innerHTML = "";
  }
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "calculateTime",
      timeInputValue: checkTimeInputValidValue(timeInputValue),
      skipDatesArr,
    });
  });
});
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "addTimeStamp") {
    insetValue({
      id: "time-balance-ext-098-1",
      value: `${
        document.getElementById("time-balance-ext-098-1").innerHTML +
        `
      <tr>
      <td>
      ${message?.index}
      </td>
      <td>
      ${message?.date}
      </td>
       <td>
      ${message?.workedTime}
      </td>
      <td style="min-width:180px">
      ${message?.data}
      </td>
      </tr>
      `
      }`,
    });
  }
  if (message.action === "updatePopup") {
    insetValue({
      id: "time-balance-ext-098-2",
      value: `<span>${message.data}</span>`,
    });
  }
  if (message.action === "totalExtraMinutes") {
    insetValue({
      id: "time-balance-ext-098-3",
      value: `<span>${message.data}</span>`,
    });
  }
  if (message.action === "totalDeficitMinutes") {
    insetValue({
      id: "time-balance-ext-098-4",
      value: `<span>${message.data}</span>`,
    });
  }

  if (message.action === "leaveTime") {
    insetValue({ id: "time-balance-ext-098-5", value: message.leaveTime });
  }
  if (message.action === "leaveTimeWithBreak") {
    insetValue({
      id: "time-balance-ext-098-6",
      value: message.leaveTimeWithBreak,
    });
  }
  if (message.action === "countDown") {
    insetValue({ id: "time-balance-ext-098-7", value: message.countDown });
  }
  if (message.action === "extraTimeHeading") {
    insetValue({
      id: "time-balance-ext-098-8",
      value: message.extraTimeHeading,
    });
  }
  if (message.action === "newWorkingHours") {
    insetValue({
      id: "time-balance-ext-098-11",
      value: message.value,
    });
  }
  if (message.action === "breakTime") {
    insetValue({
      id: "time-balance-ext-098-12",
      value: message.data,
    });
  }
});
