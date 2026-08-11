document.querySelectorAll('a[href="#"]').forEach((link) => {
  link.addEventListener('click', (event) => event.preventDefault());
});

const ACCESS_PASSWORD = '9090';
const ACCESS_SESSION_KEY = 'ida-portfolio-access';
const UNLOCK_DURATION = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 850;
const root = document.documentElement;
const gate = document.querySelector('.access-gate');
const form = document.querySelector('.access-gate__form');
const input = document.querySelector('#portfolio-password');
const error = document.querySelector('#access-error');
const portfolio = document.querySelector('#portfolio-content');

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

const resetPortfolioScroll = () => {
  const previousScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  window.scrollTo(0, 0);
  root.style.scrollBehavior = previousScrollBehavior;
};

resetPortfolioScroll();

const hasSessionAccess = () => {
  try {
    return sessionStorage.getItem(ACCESS_SESSION_KEY) === 'granted';
  } catch {
    return false;
  }
};

const rememberSessionAccess = () => {
  try {
    sessionStorage.setItem(ACCESS_SESSION_KEY, 'granted');
  } catch {
    // The gate still works when browser storage is unavailable.
  }
};

const revealPortfolio = (animate = true) => {
  resetPortfolioScroll();
  portfolio.removeAttribute('inert');
  portfolio.removeAttribute('aria-hidden');

  if (!animate) {
    root.classList.remove('is-locked');
    gate.remove();
    return;
  }

  root.classList.add('is-unlocking');
  window.setTimeout(() => {
    resetPortfolioScroll();
    gate.remove();
    root.classList.remove('is-locked', 'is-unlocking');
  }, UNLOCK_DURATION);
};

if (hasSessionAccess()) {
  revealPortfolio(false);
} else {
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    window.requestAnimationFrame(() => input.focus({ preventScroll: true }));
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (input.value === ACCESS_PASSWORD) {
      rememberSessionAccess();
      error.textContent = '';
      input.removeAttribute('aria-invalid');
      revealPortfolio();
      return;
    }

    error.textContent = 'Неверный пароль';
    input.setAttribute('aria-invalid', 'true');
    input.value = '';
    form.classList.remove('is-shaking');
    void form.offsetWidth;
    form.classList.add('is-shaking');
    input.focus();
  });

  input.addEventListener('input', () => {
    error.textContent = '';
    input.removeAttribute('aria-invalid');
  });
}
