const insetValue = ({ id, value }) => {
  document.getElementById(id).innerHTML = value;
};

document.getElementById("calculate").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "calculateTime" });
  });
});
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "addTimeStamp") {
    // alert(document.getElementById("time-balance-ext-098-1").innerHTML);
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
      <td>
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
});

// const checkTime = () => {
//   var table = document.getElementById("all_attendace_table");

//   function Includes({ r, c, value }) {
//     return table.rows[r].cells[c].innerHTML?.includes(value);
//   }

//   function GetCellValues() {
//     const arr = [];
//     for (var r = 0, n = table?.rows?.length; r < n; r++) {
//       const arr2 = [];
//       for (var c = 0, m = table?.rows[r]?.cells?.length; c < m; c++) {
//         if (
//           (c === 2 || c === 4) &&
//           (Includes({ value: "20", r, c }) || Includes({ value: ":", r, c })) &&
//           !Includes({ value: "<", r, c })
//         ) {
//           console.log(table.rows[r].cells[c].innerHTML);
//           arr2.push(table.rows[r].cells[c].innerHTML);
//         }
//       }
//       if (arr2?.length > 0) {
//         arr.push(arr2);
//       }
//     }
//     return arr.filter((item) => item[1] !== "00:00");
//   }

//   const workLog = GetCellValues();
//   // Work log data (Format: "Date, Worked Hours")
//   console.log(workLog);

//   // Convert HH:MM to total minutes
//   const timeToMinutes = (time) => {
//     const [hours, minutes] = time.split(":").map(Number);
//     return hours * 60 + minutes;
//   };

//   // Convert minutes back to HH:MM format
//   const minutesToTime = (minutes) => {
//     const h = Math.floor(Math.abs(minutes) / 60);
//     const m = Math.abs(minutes) % 60;
//     return `${minutes < 0 ? "-" : ""}${String(h).padStart(2, "0")}:${String(
//       m
//     ).padStart(2, "0")}`;
//   };

//   // Standard work duration (8 hours 30 minutes)
//   const standardMinutes = timeToMinutes("08:30");

//   let totalExtraMinutes = 0;
//   let totalDeficitMinutes = 0;

//   // Process each day's work log
//   workLog.forEach(([date, workedTime]) => {
//     const workedMinutes = timeToMinutes(workedTime);
//     const difference = workedMinutes - standardMinutes;

//     if (difference > 0) {
//       totalExtraMinutes += difference;
//       console.log(`${date}: Extra time +${minutesToTime(difference)}`);
//     } else {
//       totalDeficitMinutes += Math.abs(difference);
//       console.log(`${date}: Deficit time -${minutesToTime(difference)}`);
//     }
//   });

//   // Calculate final extra time balance
//   const finalBalance = totalExtraMinutes - totalDeficitMinutes;
//   console.log(`\nTotal Extra Minutes: ${minutesToTime(totalExtraMinutes)}`);
//   console.log(`Total Deficit Minutes: ${minutesToTime(totalDeficitMinutes)}`);
//   console.log(`Final Extra Time Balance: ${minutesToTime(finalBalance)}`);
//   const finalTime = `Final Extra Time Balance: ${minutesToTime(finalBalance)}`;

//   document.getElementById("time-balance-ext-098-1").innerHTML = finalTime;
// };

// const btn = document.getElementById("calculate");

// btn.addEventListener("click", checkTime);
