const filterGroup = document.querySelector('.service-filters');
const filterButtons = [...filterGroup.querySelectorAll('button')];
const serviceCards = [...document.querySelectorAll('#service-grid [data-category]')];
const cleaningPriceNote = document.querySelector('#cleaning-price-note');

filterGroup.hidden = false;

for (const button of filterButtons) {
  button.addEventListener('click', () => {
    const category = button.dataset.filter;

    for (const filter of filterButtons) {
      filter.setAttribute('aria-pressed', String(filter === button));
    }

    for (const card of serviceCards) {
      card.hidden = category !== 'all' && card.dataset.category !== category;
    }

    cleaningPriceNote.hidden = category === 'laundry';
  });
}

const servicePicker = document.querySelector('.service-picker');
const serviceDropdown = document.querySelector('.service-dropdown');
const serviceTrigger = document.querySelector('#booking-service');
const serviceValue = document.querySelector('#booking-service-value');
const servicePlaceholder = serviceValue.textContent;
const serviceOptions = document.querySelector('#booking-services');
const serviceCardStyles = ['standard-card', 'festive-card'];
const agentLinks = [...document.querySelectorAll('[data-agent]')].map(link => ({
  link,
  url: new URL(link.href),
}));

for (const card of serviceCards) {
  const option = document.createElement('button');
  const name = document.createElement('span');

  name.className = 'service-choice-name';
  name.textContent = card.querySelector('h3').textContent;
  option.className = 'service-choice service-option';
  option.classList.add(...serviceCardStyles.filter(style => card.classList.contains(style)));
  option.type = 'button';
  option.value = card.querySelector('[data-service]').dataset.service;
  option.tabIndex = -1;
  option.setAttribute('role', 'option');
  option.setAttribute('aria-selected', 'false');
  option.append(card.querySelector('.service-icon').cloneNode(true), name, card.querySelector('.price').cloneNode(true));
  serviceOptions.append(option);
}

const bookingOptions = [...serviceOptions.children];
const bookingOptionByValue = new Map(bookingOptions.map(option => [option.value, option]));
let selectedOption = bookingOptions[0];

function updateBookingLinks() {
  const service = selectedOption.value;

  for (const { link, url } of agentLinks) {
    const greeting = `Hi ${link.dataset.agent}!`;
    const message = service
      ? `${greeting} I'd like to book ${service} with Fresh and Clean Co. Could you please confirm availability and the price?`
      : `${greeting} I'd like to enquire about booking with Fresh and Clean Co.`;

    url.searchParams.set('text', message);
    link.href = url.href;
  }
}

function selectBookingOption(option) {
  selectedOption.setAttribute('aria-selected', 'false');
  option.setAttribute('aria-selected', 'true');
  selectedOption = option;
  if (option.value) {
    serviceValue.replaceChildren(...Array.from(option.childNodes, node => node.cloneNode(true)));
  } else {
    serviceValue.textContent = servicePlaceholder;
  }

  for (const style of serviceCardStyles) {
    serviceTrigger.classList.toggle(style, option.classList.contains(style));
  }

  updateBookingLinks();
}

function setServiceDropdownOpen(isOpen) {
  serviceOptions.hidden = !isOpen;
  serviceTrigger.setAttribute('aria-expanded', String(isOpen));

  if (isOpen) selectedOption.focus();
}

servicePicker.hidden = false;

serviceTrigger.addEventListener('click', () => setServiceDropdownOpen(serviceOptions.hidden));
serviceTrigger.addEventListener('keydown', event => {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
  event.preventDefault();
  setServiceDropdownOpen(true);
});

serviceOptions.addEventListener('click', event => {
  const option = event.target.closest('.service-option');
  if (!option) return;

  selectBookingOption(option);
  setServiceDropdownOpen(false);
  serviceTrigger.focus();
});

serviceOptions.addEventListener('keydown', event => {
  const activeOption = event.target;
  let nextOption;

  switch (event.key) {
    case 'ArrowDown': nextOption = activeOption.nextElementSibling || bookingOptions[0]; break;
    case 'ArrowUp': nextOption = activeOption.previousElementSibling || bookingOptions.at(-1); break;
    case 'Home': nextOption = bookingOptions[0]; break;
    case 'End': nextOption = bookingOptions.at(-1); break;
    case 'Escape':
    case 'Tab':
      if (event.key === 'Escape') event.preventDefault();
      setServiceDropdownOpen(false);
      serviceTrigger.focus();
      return;
    default: return;
  }

  event.preventDefault();
  nextOption.focus();
});

document.addEventListener('click', event => {
  if (!serviceOptions.hidden && !serviceDropdown.contains(event.target)) setServiceDropdownOpen(false);
});

for (const link of document.querySelectorAll('[data-service]')) {
  link.addEventListener('click', () => {
    const option = bookingOptionByValue.get(link.dataset.service);
    if (option) selectBookingOption(option);
  });
}

window.addEventListener('pageshow', updateBookingLinks);
