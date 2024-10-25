import { loadScript } from "../../scripts/aem.js";
import {
  getTextValues,
  parseImage,
  tryMoveInstrumentation,
} from "../../scripts/custom.js";

await loadScript("https://cdn.jsdelivr.net/npm/date-fns@3.6.0/cdn.min.js");

/* global dateFns */

function format(src) {
  if (!src) return "00";
  return `${src}`.padStart(2, "0");
}

function durationFromCountdownValue(countdownValue) {
  const endDate = new Date(countdownValue);
  const now = new Date();
  const { hours, minutes, seconds } = dateFns.intervalToDuration({
    start: now,
    end: endDate,
  });
  const days = dateFns.differenceInDays(endDate, now);
  return {
    hours,
    minutes,
    seconds,
    days,
  };
}

function updateCountdownShort(el, countdownValue) {
  let value = "";
  if (countdownValue) {
    const { hours, minutes, seconds, days } =
      durationFromCountdownValue(countdownValue);

    let resultStringShort = `${format(hours)}:${format(minutes)}:${format(seconds)}`;
    if (days > 0) {
      resultStringShort = `${format(days)}:${resultStringShort}`;
    }
    value = resultStringShort;
  }
  el.textContent = value;
}

function updateCountdownBig(el, countdownValue) {
  const value = {
    days: "",
    hours: "",
    minutes: "",
    seconds: "",
  };
  if (countdownValue) {
    const { hours, minutes, seconds, days } =
      durationFromCountdownValue(countdownValue);

    value.days = `${format(days)}`;
    value.hours = `${format(hours)}`;
    value.minutes = `${format(minutes)}`;
    value.seconds = `${format(seconds)}`;
  }
  el.querySelector(".value.days").textContent = value.days;
  el.querySelector(".value.hours").textContent = value.hours;
  el.querySelector(".value.minutes").textContent = value.minutes;
  el.querySelector(".value.seconds").textContent = value.seconds;
}

export default function decorate(block) {
  const [
    typePropEl,
    layoutEl,
    backgroundEl,
    textPropEl,
    buttonPropEl,
    countdownPropEl,
    subTextPropEl,
    fallbackImageEl,
  ] = [...block.children];

  const [
    typeValue /* "", "countdown", "countdown-big" */,
    layout,
    backgroundColor,
    textValue,
    countdownValue,
    subTextValue,
  ] = getTextValues(
    typePropEl,
    layoutEl,
    backgroundEl,
    textPropEl,
    countdownPropEl,
    subTextPropEl,
  );

  const [linkEl, linkLabelEl] = [...buttonPropEl.children[0].children];
  const linkValue = linkEl.querySelector("a").getAttribute("href");
  const linkLabelValue = linkLabelEl.textContent;

  block.textContent = "";
  if (typeValue) {
    block.classList.add(typeValue);
  }

  if (layout) {
    block
      .closest(".banner-promotion-wrapper")
      .classList.add(`banner-promotion--${layout}`);
    block.classList.add("container");
  }

  if (backgroundColor) {
    block
      .closest(".banner-promotion-wrapper")
      .classList.add(`banner-promotion--${backgroundColor}`);
  }

  if (!typeValue) {
    block.innerHTML = `
      <p class="text h8-black">${textValue}</p>
      <a class="button button--small ${backgroundColor === "rhodes" ? "secondary" : "primary"} link" href="${linkValue}">${linkLabelValue}</a>
    `;
  } else if (typeValue === "countdown") {
    const { hours, minutes, seconds } =
      durationFromCountdownValue(countdownValue);
    const noHoursRemaining = !hours || hours <= 0;
    const noMinutesRemaining = !minutes || minutes <= 0;
    const noSecondsRemaining = !seconds || seconds <= 0;

    if (noHoursRemaining && noMinutesRemaining && noSecondsRemaining) {
      block.innerHTML = "";
      return;
    }

    block.innerHTML = `
      <div>
        <p class="text h9-bold">${textValue}</p>
        <div class="countdown">
          <svg class="countdown-icon" width="14" height="17" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 2.42857C5.61553 2.42857 4.26216 2.85587 3.11101 3.65644C1.95987 4.457 1.06266 5.59487 0.532846 6.92616C0.003033 8.25745 -0.13559 9.72237 0.134506 11.1357C0.404603 12.5489 1.07129 13.8471 2.05026 14.8661C3.02922 15.885 4.2765 16.5789 5.63437 16.86C6.99224 17.1411 8.3997 16.9968 9.67879 16.4454C10.9579 15.894 12.0511 14.9601 12.8203 13.762C13.5895 12.5639 14 11.1553 14 9.71428C13.9979 7.78267 13.2597 5.9308 11.9474 4.56495C10.6351 3.19909 8.85587 2.43078 7 2.42857ZM7 15.7857C5.84628 15.7857 4.71846 15.4296 3.75918 14.7625C2.79989 14.0954 2.05222 13.1471 1.61071 12.0377C1.16919 10.9283 1.05368 9.70755 1.27876 8.52981C1.50384 7.35207 2.05941 6.27024 2.87521 5.42114C3.69102 4.57203 4.73042 3.99378 5.86198 3.75952C6.99353 3.52525 8.16642 3.64548 9.23232 4.10502C10.2982 4.56455 11.2093 5.34274 11.8502 6.34118C12.4912 7.33962 12.8333 8.51347 12.8333 9.71428C12.8316 11.324 12.2165 12.8672 11.1229 14.0054C10.0293 15.1437 8.54656 15.7839 7 15.7857ZM10.3294 6.24902C10.3836 6.3054 10.4266 6.37236 10.456 6.44607C10.4854 6.51978 10.5005 6.59878 10.5005 6.67857C10.5005 6.75836 10.4854 6.83736 10.456 6.91107C10.4266 6.98478 10.3836 7.05174 10.3294 7.10812L7.41271 10.1438C7.35851 10.2002 7.29417 10.245 7.22336 10.2755C7.15255 10.3061 7.07665 10.3218 7 10.3218C6.92335 10.3218 6.84746 10.3061 6.77665 10.2755C6.70583 10.245 6.64149 10.2002 6.58729 10.1438C6.5331 10.0874 6.4901 10.0205 6.46077 9.94676C6.43144 9.87305 6.41634 9.79406 6.41634 9.71428C6.41634 9.63451 6.43144 9.55551 6.46077 9.48181C6.4901 9.40811 6.5331 9.34114 6.58729 9.28473L9.50396 6.24902C9.55814 6.19257 9.62247 6.14778 9.69329 6.11723C9.7641 6.08668 9.84001 6.07095 9.91667 6.07095C9.99333 6.07095 10.0692 6.08668 10.14 6.11723C10.2109 6.14778 10.2752 6.19257 10.3294 6.24902ZM4.66667 0.607143C4.66667 0.446118 4.72813 0.291689 4.83752 0.177828C4.94692 0.0639666 5.09529 0 5.25 0H8.75C8.90471 0 9.05308 0.0639666 9.16248 0.177828C9.27188 0.291689 9.33333 0.446118 9.33333 0.607143C9.33333 0.768167 9.27188 0.922596 9.16248 1.03646C9.05308 1.15032 8.90471 1.21429 8.75 1.21429H5.25C5.09529 1.21429 4.94692 1.15032 4.83752 1.03646C4.72813 0.922596 4.66667 0.768167 4.66667 0.607143Z" fill="currentColor"/>
          </svg>
          <p class="countdown-value h8-bold"></p>
        </div>
      </div>
      <a class="button button--small ${backgroundColor === "rhodes" ? "secondary" : "primary"} link" href="${linkValue}">${linkLabelValue}</a>
    `;
  } else if (typeValue === "countdown-big") {
    const { hours, minutes, seconds, days } =
      durationFromCountdownValue(countdownValue);
    const noDaysRemaining = !days || days <= 0;
    const noHoursRemaining = !hours || hours <= 0;
    const noMinutesRemaining = !minutes || minutes <= 0;
    const noSecondsRemaining = !seconds || seconds <= 0;

    if (
      parseImage(fallbackImageEl) &&
      noDaysRemaining &&
      noHoursRemaining &&
      noMinutesRemaining &&
      noSecondsRemaining
    ) {
      block.innerHTML = fallbackImageEl.innerHTML;
      block.querySelector(".banner-promotion div").classList.add("img-wrapper");
      block.classList.add("has-fallback-img");
      return;
    }

    block.innerHTML = `
      <p class="text h7-bold w-30">${textValue}</p>
      <div class="countdown-big w-30">
        <div class="value-group">
          <div class="value days h3-black"></div>
          <div class="unit h9-bold">Days</div>
        </div>
        <div class="separator">:</div>
        <div class="value-group">
          <div class="value hours h3-black"></div>
          <div class="unit h9-bold">Hours</div>
        </div>
        <div class="separator">:</div>
        <div class="value-group">
          <div class="value minutes h3-black"></div>
          <div class="unit h9-bold">Minutes</div>
        </div>
        <div class="separator">:</div>
        <div class="value-group">
          <div class="value seconds h3-black"></div>
          <div class="unit h9-bold">Seconds</div>
        </div>
      </div>
      <div class="w-30">
      <p class="sub-text h5-bold">${subTextValue}</p>
      <a class="button button--small ${backgroundColor === "rhodes" ? "secondary" : "primary"} link" href="${linkValue}">${linkLabelValue}</a>
      </div>
      `;
  }

  tryMoveInstrumentation(textPropEl, block.querySelector(".text"));
  tryMoveInstrumentation(buttonPropEl, block.querySelector(".link"));

  if (typeValue === "countdown") {
    const countdownEl = block.querySelector(".countdown-value");

    updateCountdownShort(countdownEl, countdownValue);
    setInterval(() => {
      updateCountdownShort(countdownEl, countdownValue);
    }, 1000);

    tryMoveInstrumentation(countdownPropEl, countdownEl);
  }
  if (typeValue === "countdown-big") {
    const countdownEl = block.querySelector(".countdown-big");

    updateCountdownBig(countdownEl, countdownValue);
    setInterval(() => {
      updateCountdownBig(countdownEl, countdownValue);
    }, 1000);

    tryMoveInstrumentation(subTextPropEl, block.querySelector(".sub-text"));
    tryMoveInstrumentation(countdownPropEl, countdownEl);
  }
}
