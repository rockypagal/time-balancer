const checkTime = () => {
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

  function Includes({ r, c, value }) {
    return table.rows[r].cells[c].innerHTML?.includes(value);
  }

  function checkLastChar({ r, c }) {
    const string = table.rows[r].cells[c].innerHTML.trim();

    return string?.length > 1 && string[string?.length - 1] === "-";
  }

  function GetCellValues() {
    const arr = [];
    for (let r = 0; r < table.rows.length; r++) {
      const arr2 = [];
      for (let c = 0; c < table.rows[r].cells.length; c++) {
        if (
          (c === 2 || c === 4) &&
          (Includes({ value: "20", r, c }) || Includes({ value: ":", r, c })) &&
          !Includes({ value: "<", r, c })
        ) {
          arr2.push(table.rows[r].cells[c].innerHTML);
        } else if (c === 3 && checkLastChar({ r, c })) {
          arr2.push(table.rows[r].cells[c].innerHTML.replace(" - ", ""));
        }
      }
      if (arr2.length > 0) {
        arr.push(arr2);
      }
    }
    // return arr.filter((item, index) => {
    //   if (item[1] !== "00:00" && index !== arr?.length - 1) {
    //     return true;
    //   } else if (item[1]?.includes("AM") || item[1]?.includes("PM")) {
    //     todaysData = item;
    //     return false;
    //   }

    //   return false;
    // });

    return arr.reduce((acc, item) => {
      if (item[1] !== "00:00" && item?.length === 2) {
        acc.push(item);
      } else if (item[1]?.includes("AM") || item[1]?.includes("PM")) {
        todaysData = item;
        return acc;
      }

      return acc;
    }, []);
  }
  const workLog = GetCellValues();

  // ******************  Find Todays Remaining hours

  if (todaysData) {
    const date1 = new Date()
      .toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
      .replace(" ", ",");

    const unixTimeInMilliseconds = new Date(
      `${date1}, ${todaysData[1]}`
    ).valueOf();
    const eightHoursThirtyMinutesInMilliseconds =
      8 * 60 * 60 * 1000 + 30 * 60 * 1000; // 8h 30m in ms

    const newUnixTimeInMilliseconds =
      unixTimeInMilliseconds + eightHoursThirtyMinutesInMilliseconds;

    const todaysWorkedHour = todaysData[2]?.split(":");

    const todaysWorkedHourInML =
      parseInt(todaysWorkedHour[0]) * 60 * 60 * 1000 +
      parseInt(todaysWorkedHour[1]) * 60 * 1000;

    // const workedHour = (06*60*60*1000) + (30*60*1000)
    const arrivedPlusWorkedHour =
      unixTimeInMilliseconds.valueOf() + todaysWorkedHourInML;

    const breakTime = new Date().valueOf() - arrivedPlusWorkedHour;

    console.log(
      "with break time",
      new Date(newUnixTimeInMilliseconds + breakTime)
    );

    const date = new Date(newUnixTimeInMilliseconds);
    const dateWithBreak = new Date(newUnixTimeInMilliseconds + breakTime);

    const leaveTimeWithBreak = dateWithBreak.toLocaleString("en-GB", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
    });

    const leaveTime = date.toLocaleString("en-GB", {
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

    //****************** */

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
      const hours = Math.floor(
        (Math.abs(timeLeft) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor(
        (Math.abs(timeLeft) % (1000 * 60 * 60)) / (1000 * 60)
      );
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
  // *******************

  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes) => {
    const h = Math.floor(Math.abs(minutes) / 60);
    const m = Math.abs(minutes) % 60;
    return `${minutes < 0 ? "-" : ""}${String(h).padStart(2, "0")}:${String(
      m
    ).padStart(2, "0")}`;
  };

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

  const standardMinutes = timeToMinutes("08:30");

  let totalExtraMinutes = 0;
  let totalDeficitMinutes = 0;

  workLog.forEach(([date, workedTime], index) => {
    const weekday = new Date(date).getDay();

    const workedMinutes = timeToMinutes(workedTime);
    const difference = checkWeekDay(weekday, true)
      ? workedMinutes - standardMinutes
      : workedMinutes;

    if (difference > 0) {
      totalExtraMinutes += difference;
      chrome.runtime.sendMessage({
        action: "addTimeStamp",
        data: `Extra time ${checkWeekDay(
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
        data: `Deficit time <span class="til-color">-${minutesToTime(
          difference
        )}</span>`,
        date,
        workedTime,
        index: index + 1,
      });
    }
  });

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
    checkTime();
  }
});
