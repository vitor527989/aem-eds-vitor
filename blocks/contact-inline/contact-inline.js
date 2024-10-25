import {
  getRichTextContent,
  getTextValue,
  parseButton,
  tryMoveInstrumentation,
} from "../../scripts/custom.js";

import { loadScript } from "../../scripts/aem.js";
import { RESPONSE_IQ_LOCALES } from "../../scripts/repsonse-iq.js";

const LOCAL_IN_URL = "en-cy"; // hardcoded example for 'EN-CY' local
const local = RESPONSE_IQ_LOCALES.find(
  (loc) => loc.local === LOCAL_IN_URL.toUpperCase(),
);

const responseIQEnabled = false;

if (responseIQEnabled) {
  await loadScript(
    `https://app.responseiq.com/widgetsrc.php?widget=${local.widgetId}&widgetrnd=Math.random()`,
  );
}

export default function decorate(block) {
  const [
    textPhoneEl,
    phoneNumberEl,
    callbackCheckboxEl,
    textContactFormEl,
    buttonContactFormEl,
  ] = [...block.children];

  const [textPhone, textContactForm] = [textPhoneEl, textContactFormEl].map(
    getRichTextContent,
  );
  const [phoneNumber, callbackCheckboxLabel] = [
    phoneNumberEl,
    callbackCheckboxEl,
  ].map(getTextValue);
  const contactUsBtn = parseButton(buttonContactFormEl.children[0]);

  let htmlContent = ``;
  // T0DO: Adapte after callback implementation is fully done
  const showCheckboxMarkup = false;

  htmlContent += `
        <div class="contact-card">
          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M3.2749 5.77724C3.06458 4.37425 4.18292 3.25 5.50888 3.25H8.53931C8.85236 3.25 9.13248 3.44444 9.24196 3.73773L10.4178 6.88793C10.4653 7.01523 10.4774 7.15304 10.4527 7.28665L9.87086 10.4311C10.5754 12.0767 11.7285 13.1943 13.6486 14.2033L16.7201 13.6037C16.8583 13.5767 17.0012 13.5891 17.1326 13.6396L20.2688 14.8437C20.5587 14.955 20.75 15.2334 20.75 15.5439V18.4616C20.75 19.8584 19.5223 21.0177 18.0635 20.6978C15.5886 20.1553 10.9838 18.773 7.75288 15.5177L8.27288 15.0016L7.75288 15.5177C4.65488 12.3962 3.622 8.0926 3.2749 5.77724L3.2749 5.77724ZM5.50888 4.75C5.01291 4.75 4.69654 5.14274 4.75832 5.55486C5.09053 7.7709 6.06061 11.6832 8.81753 14.461L8.28521 14.9894L8.81753 14.461C11.7352 17.4008 15.9859 18.7067 18.3848 19.2327L18.3848 19.2327C18.8082 19.3255 19.25 19.0054 19.25 18.4616V16.0593L16.7961 15.1171L13.6804 15.7255C13.5167 15.7574 13.347 15.7339 13.1982 15.6586C10.8375 14.4648 9.28976 13.0401 8.39604 10.7889C8.34397 10.6578 8.32996 10.5145 8.35564 10.3758L8.93991 7.21793L8.01872 4.75H5.50888Z" fill="#00B8EA"/>
          </svg>
          <div class="phone-text">${textPhone.innerHTML}</div>
        `;
  if (phoneNumber) {
    htmlContent += `<a class="phone-number" href="tel:${phoneNumber}">${phoneNumber}</a>`;
  }
  if (showCheckboxMarkup) {
    htmlContent += `
        <label class="callback-checkbox">
          <input type="checkbox"/>
          <span>${callbackCheckboxLabel}</span>
        </label>
      `;
  }

  htmlContent += `
        </div>
        <div class="contact-card">
          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M8.37596 8.58398C8.60573 8.23933 9.07138 8.1462 9.41602 8.37597L13.5 11.0986L17.584 8.37597C17.9286 8.1462 18.3943 8.23933 18.624 8.58398C18.8538 8.92862 18.7607 9.39428 18.416 9.62404L13.916 12.624C13.6641 12.792 13.3359 12.792 13.084 12.624L8.58397 9.62404C8.23933 9.39428 8.1462 8.92862 8.37596 8.58398Z" fill="#00B8EA"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M2.25 13.5C2.25 13.0858 2.58579 12.75 3 12.75H5C5.41421 12.75 5.75 13.0858 5.75 13.5C5.75 13.9142 5.41421 14.25 5 14.25H3C2.58579 14.25 2.25 13.9142 2.25 13.5Z" fill="#00B8EA"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M0.25 10.5C0.25 10.0858 0.585786 9.75 1 9.75H5C5.41421 9.75 5.75 10.0858 5.75 10.5C5.75 10.9142 5.41421 11.25 5 11.25H1C0.585786 11.25 0.25 10.9142 0.25 10.5Z" fill="#00B8EA"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M7 5.75C6.30964 5.75 5.75 6.30964 5.75 7V7.5C5.75 7.91421 5.41421 8.25 5 8.25C4.58579 8.25 4.25 7.91421 4.25 7.5V7C4.25 5.48122 5.48122 4.25 7 4.25H20C21.5188 4.25 22.75 5.48122 22.75 7V17C22.75 18.5188 21.5188 19.75 20 19.75H7C5.48122 19.75 4.25 18.5188 4.25 17V16.5C4.25 16.0858 4.58579 15.75 5 15.75C5.41421 15.75 5.75 16.0858 5.75 16.5V17C5.75 17.6904 6.30964 18.25 7 18.25H20C20.6904 18.25 21.25 17.6904 21.25 17V7C21.25 6.30964 20.6904 5.75 20 5.75H7Z" fill="#00B8EA"/>
          </svg>
          <div class="contact-form-text">${textContactForm.innerHTML}</div>
        `;
  if (contactUsBtn) {
    htmlContent += `<a class="contact-us-button button outlined" href="${contactUsBtn.link}">${contactUsBtn.label}</a>`;
  }
  htmlContent += `</div>`;

  block.innerHTML = htmlContent;

  try {
    tryMoveInstrumentation(phoneNumberEl, block.querySelector(".phone-number"));

    if (showCheckboxMarkup) {
      tryMoveInstrumentation(
        callbackCheckboxEl,
        block.querySelector(".callback-checkbox"),
      );
    }

    tryMoveInstrumentation(
      buttonContactFormEl,
      block.querySelector(".contact-us-button"),
    );
  } catch (e) {
    console.error("error initializing instrumentation", e);
  }
}
