(() => {
 const legacy={library:'library.html',collection:'collection.html',batch:'records.html'};
 const isHome=location.pathname.endsWith('/')||location.pathname.endsWith('/index.html');
 function redirect(){const target=legacy[location.hash.slice(1)];if(isHome&&target)location.replace(new URL(target,location.href).href);}
 redirect();window.addEventListener('hashchange',redirect);
})();
