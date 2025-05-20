const checkTime = (timeInputValue, skipDatesArr) => {
  if (
    window.location.href !==
    "https://account.incipientinfo.com/#/attendance/dashboard"
  ) {
    chrome.runtime.sendMessage({
      action: "updatePopup",
      data: `<span class="red-color">Wrong page use it on the Attendance page</span>`,
    });
    return;
  }
  const table = document.getElementById("all_attendace_table");

  let todaysData;
  if (!table) {
    return;
  }

  // HACK ************ time convertion function *********

  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes) => {
    const h = Math.floor(Math.abs(minutes) / 60);
    const m = Math.abs(minutes) % 60;
    return `${minutes < 0 ? "-" : ""}${String(h).padStart(2, "0")}h ${String(
      m
    ).padStart(2, "0")}m`;
  };

  const milSecondsToHours = (milSeconds) => {
    return Math.floor(
      (Math.abs(milSeconds) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
  };
  const milSecondsToMinutes = (milSeconds) => {
    return Math.floor((Math.abs(milSeconds) % (1000 * 60 * 60)) / (1000 * 60));
  };
  // ************ time convertion function *********

  // HACK ******** Table check functions ************

  function Includes({ r, c, value }) {
    return table.rows[r].cells[c].innerHTML?.includes(value);
  }

  function checkLastChar({ r, c }) {
    const string = table.rows[r].cells[c].innerHTML.trim();

    return string?.length > 1 && string[string?.length - 1] === "-";
  }

  // function GetCellValues() {
  //   const arr = [];
  //   for (let r = 0; r < table.rows.length; r++) {
  //     const arr2 = [];
  //     for (let c = 0; c < table.rows[r].cells.length; c++) {
  //       if (
  //         (c === 2 || c === 4) &&
  //         (Includes({ value: "20", r, c }) || Includes({ value: ":", r, c })) &&
  //         !Includes({ value: "<", r, c })
  //       ) {
  //         arr2.push(table.rows[r].cells[c].innerHTML);
  //       } else if (c === 3 && checkLastChar({ r, c })) {
  //         arr2.push(table.rows[r].cells[c].innerHTML.replace(" - ", ""));
  //       }
  //     }
  //     if (arr2.length > 0) {
  //       arr.push(arr2);
  //     }
  //   }
  //   // ******** Table check functions ************

  //   // return arr.filter((item, index) => {
  //   //   if (item[1] !== "00:00" && index !== arr?.length - 1) {
  //   //     return true;
  //   //   } else if (item[1]?.includes("AM") || item[1]?.includes("PM")) {
  //   //     todaysData = item;
  //   //     return false;
  //   //   }

  //   //   return false;
  //   // });

  //   return arr.reduce((acc, item) => {
  //     if (item[1] !== "00:00" && item?.length === 2) {
  //       acc.push(item);
  //     } else if (item[1]?.includes("AM") || item[1]?.includes("PM")) {
  //       todaysData = item;
  //       return acc;
  //     }

  //     return acc;
  //   }, []);
  // }

  function GetCellValues() {
    const arr = [];
    for (let r = 0; r < table.rows.length; r++) {
      const arr2 = [];
      for (let c = 0; c < table.rows[r].cells.length; c++) {
        if (
          (c === 2 || c === 4 || c === 6) &&
          (Includes({ value: "20", r, c }) || Includes({ value: ":", r, c })) &&
          !Includes({ value: "<", r, c })
        ) {
          if (
            c === 2 &&
            skipDatesArr &&
            skipDatesArr?.includes(
              table.rows[r].cells[c].innerHTML.toUpperCase()
            )
          ) {
            continue;
          }
          arr2.push(table.rows[r].cells[c].innerHTML);
        } else if (c === 3 && checkLastChar({ r, c })) {
          arr2.push(table.rows[r].cells[c].innerHTML.replace(" - ", ""));
        } else if (
          arr2.length > 0 &&
          c === 6 &&
          table.rows[r].cells[c].childElementCount > 1 &&
          arr2[1].split(":")[0] < 8 &&
          table.rows[r].cells[c].firstChild.innerText.includes("Day end")
        ) {
          //
          arr2.push("half day");
        }
      }
      if (arr2.length > 0) {
        arr.push(arr2);
      }
    }

    return arr.reduce((acc, item) => {
      if (item[1] !== "00:00" && item?.length === 2) {
        acc.push(item);
      } else if (item?.length === 3 && item[2] === "half day") {
        acc.push(item);
      } else if (item[1]?.includes("AM") || item[1]?.includes("PM")) {
        todaysData = item;
        return acc;
      }

      return acc;
    }, []);
  }
  const workLog = GetCellValues();

  // HACK ******************  Find Todays Remaining hours ****************
  const date1 = new Date()
    .toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .replace(" ", ",");

  function todaysDefaultWorkingHours(arriveTime, breakTime) {
    let hours = 8;
    let minutes = 30;
    if (timeInputValue) {
      const leaveTime = new Date(`${date1}, ${timeInputValue}`).valueOf();

      let timeLeft = arriveTime - (leaveTime - breakTime);

      hours = milSecondsToHours(timeLeft);
      minutes = milSecondsToMinutes(timeLeft);

      minutes = `${minutes}`.length === 1 ? `0${minutes}` : minutes;

      workLog.push([todaysData[0], `${hours}:${minutes}`]);

      chrome.runtime.sendMessage({
        action: "newWorkingHours",
        value: `<h2 class="heading-h2" id="time-balance-ext-098-9">
        Today's Working Hours (After Break)
      </h2>
      <h2 class="heading-h2">${hours}h:${minutes}m</h2>`,
      });
    }

    return hours * 60 * 60 * 1000 + minutes * 60 * 1000;
  }

  if (todaysData) {
    const unixTimeInMilliseconds = new Date(
      `${date1}, ${todaysData[1]}`
    ).valueOf();

    const todaysWorkedHour = todaysData[2]?.split(":");

    const todaysWorkedHourInML =
      parseInt(todaysWorkedHour[0]) * 60 * 60 * 1000 +
      parseInt(todaysWorkedHour[1]) * 60 * 1000;

    // const workedHour = (06*60*60*1000) + (30*60*1000)
    const arrivedPlusWorkedHour =
      unixTimeInMilliseconds.valueOf() + todaysWorkedHourInML;

    let breakTime = new Date().valueOf() - arrivedPlusWorkedHour;
    breakTime = breakTime > 90000 ? breakTime : 0;

    chrome.runtime.sendMessage({
      action: "breakTime",
      data: `${milSecondsToHours(breakTime)}h ${milSecondsToMinutes(
        breakTime
      )}m`,
    });

    const todaysDefaultWorkingHoursInMilliseconds = todaysDefaultWorkingHours(
      unixTimeInMilliseconds,
      breakTime
    ); // default 8h 30m in ms

    const newUnixTimeInMilliseconds =
      unixTimeInMilliseconds + todaysDefaultWorkingHoursInMilliseconds;
    const date = new Date(newUnixTimeInMilliseconds);
    const dateWithBreak = new Date(newUnixTimeInMilliseconds + breakTime);

    const leaveTimeWithBreak = dateWithBreak.toLocaleString("en-GB", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
    });

    const leaveTime = date.toLocaleTimeString("en-GB", {
      hour12: true,
    });

    chrome.runtime.sendMessage({
      action: "leaveTime",
      leaveTime,
    });
    chrome.runtime.sendMessage({
      action: "leaveTimeWithBreak",
      leaveTimeWithBreak,
    });
    //

    // HACK ***************** Count Down Function *******************

    // const targetDate = newUnixTimeInMilliseconds + breakTime;

    // // Update the countdown every second

    // const countDownTillEOD = () => {
    //   const now = new Date().getTime();
    //   const timeLeft = targetDate - now;

    //   // Calculate days, hours, minutes, and seconds
    //   const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    //   const hours = Math.floor(
    //     (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    //   );
    //   const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    //   const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    //   // Display the result in the countdown div

    //   chrome.runtime.sendMessage({
    //     action: "countDown",
    //     countDown: `${days ? days + "d" : ""} ${hours}h ${minutes}m ${seconds}s`,
    //   });

    //   // Check if the countdown has ended
    //   // if (timeLeft < 0) {
    //   //   clearInterval(countdownInterval);
    //   //   // document.getElementById("countdown").innerHTML = "The event has started!";
    //   // }
    // };
    // countDownTillEOD();
    // const countdownInterval = setInterval(countDownTillEOD, 1000);

    const targetDate = newUnixTimeInMilliseconds + breakTime;

    // Function to update the countdown
    const countDownTillEOD = () => {
      const now = new Date().getTime();
      const timeLeft = targetDate - now; // Can be positive or negative

      // Calculate days, hours, minutes, and seconds
      const days = Math.floor(Math.abs(timeLeft) / (1000 * 60 * 60 * 24));
      const hours = milSecondsToHours(timeLeft);
      const minutes = milSecondsToMinutes(timeLeft);
      const seconds = Math.floor((Math.abs(timeLeft) % (1000 * 60)) / 1000);

      // Check if time has passed and add "-" sign if it's in the past
      const plus = timeLeft < 0 ? "+" : "";

      if (plus) {
        chrome.runtime.sendMessage({
          action: "extraTimeHeading",
          extraTimeHeading: `<span class="darkred-color">Extra Time</span>`,
        });
      }

      // Send message with countdown (negative when elapsed)
      chrome.runtime.sendMessage({
        action: "countDown",
        countDown: `<span class="${plus ? "darkred-color" : ""}">${plus}${
          days ? days + "d" : ""
        } ${hours}h ${minutes}m ${false ? seconds + "s" : ""}</span>`,
      });
    };

    // Initial call and interval setup
    countDownTillEOD();
    // const countdownInterval = setInterval(countDownTillEOD, 1000);
  }
  //  ***************** Count Down Function *******************

  // HACK ***************** Calculate Remaining Time with Table *******************

  const checkWeekDay = (weekday, justCheck) => {
    if (justCheck) {
      return weekday !== 0 && weekday !== 6;
    }

    if (weekday === 0) {
      return `${String.fromCodePoint(128545)} SUN`;
    } else if (weekday === 6) {
      return `${String.fromCodePoint(128545)} SAT`;
    }

    return "";
  };

  let standardMinutes = timeToMinutes("08:30");

  let totalExtraMinutes = 0;
  let totalDeficitMinutes = 0;

  workLog.forEach(([date, workedTime, halfDay], index) => {
    if (halfDay) standardMinutes = timeToMinutes(workedTime);

    const weekday = new Date(date).getDay();

    const workedMinutes = timeToMinutes(workedTime);
    const difference = checkWeekDay(weekday, true)
      ? workedMinutes - standardMinutes
      : workedMinutes;

    if (difference > 0) {
      totalExtraMinutes += difference;
      chrome.runtime.sendMessage({
        action: "addTimeStamp",
        data: `${halfDay ? "Half Day" : "Extra time"} ${checkWeekDay(
          weekday
        )} <span class="darkred-color">+${minutesToTime(difference)}</span>`,
        date,
        workedTime,
        index: index + 1,
      });
    } else {
      totalDeficitMinutes += Math.abs(difference);
      chrome.runtime.sendMessage({
        action: "addTimeStamp",
        data: `${
          halfDay ? "Half Day" : "Deficit time"
        } <span class="til-color">-${minutesToTime(difference)}</span>`,
        date,
        workedTime,
        index: index + 1,
      });
    }
    if (halfDay) standardMinutes = timeToMinutes("8:30");
  });

  //***************** Calculate Remaining Time with Table *******************

  //HACK ***************** Calculate final Total Remaining time *******************

  const finalBalance = totalExtraMinutes - totalDeficitMinutes;
  const finalTime = `Final Extra Time Balance: ${minutesToTime(finalBalance)}`;

  chrome.runtime.sendMessage({
    action: "totalExtraMinutes",
    data: `Total Extra Time: ${minutesToTime(totalExtraMinutes)}`,
  });
  chrome.runtime.sendMessage({
    action: "totalDeficitMinutes",
    data: `Total Deficit Time: ${minutesToTime(totalDeficitMinutes)}`,
  });
  chrome.runtime.sendMessage({ action: "updatePopup", data: finalTime });
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "calculateTime") {
    checkTime(message?.timeInputValue, message?.skipDatesArr);
  }
});

//***************** Calculate final Total Remaining time *******************
