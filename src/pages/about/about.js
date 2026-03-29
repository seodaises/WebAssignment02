document.addEventListener(`DOMContentLoaded`, () => {
  initTheme();
  initAccordion();
});
 
const initAccordion = () => {
  const items = document.querySelectorAll(`.faq-item`);
  items.forEach(item => {
    const btn     = item.querySelector(`.faq-btn`);
    const content = item.querySelector(`.faq-content`);
    const icon    = item.querySelector(`.faq-icon`);
    if (!btn) return;
 
    btn.addEventListener(`click`, () => {
      const isOpen = !content.classList.contains(`hidden`);
      items.forEach(i => {
        i.querySelector(`.faq-content`)?.classList.add(`hidden`);
        if (i.querySelector(`.faq-icon`)) i.querySelector(`.faq-icon`).textContent = `+`;
      });

      if (!isOpen) {
        content.classList.remove(`hidden`);
        if (icon) icon.textContent = `−`;
      }
    });
  });
};
 