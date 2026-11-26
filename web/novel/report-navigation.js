const destinations = {
 adaptation: ['../library.html', '返回全部小说'],
 ranking: ['../library.html', '返回全部小说'],
 library: ['../library.html', '返回全部小说'],
};
const referrer = document.referrer ? new URL(document.referrer) : null;
const previousSource = referrer?.origin === location.origin
 ? Object.keys(destinations).find(key => {
  const page = new URL(destinations[key][0], location.href);
  if(key==='adaptation')return false;
  return referrer.pathname === page.pathname ||
   (key === 'ranking' && referrer.pathname === new URL('../', location.href).pathname);
 })
 : undefined;
const requested = new URLSearchParams(location.search).get('from');
const source = previousSource || (Object.hasOwn(destinations, requested) ? requested : 'library');
const back = document.querySelector('.back-link');
if (back) {
 back.href = previousSource ? referrer.href : destinations[source][0];
 const label = back.lastElementChild ?? back;
 label.textContent = destinations[source][1];
 if (previousSource && history.length > 1) {
  back.addEventListener('click', event => {
   if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
   event.preventDefault();
   history.back();
  });
 }
}
