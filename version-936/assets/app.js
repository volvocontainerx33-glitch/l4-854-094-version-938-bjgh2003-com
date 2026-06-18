(function(){
function qs(s,r){return(r||document).querySelector(s)}
function qsa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
var menuButton=qs('[data-menu-button]');
var mobileMenu=qs('[data-mobile-menu]');
if(menuButton&&mobileMenu){menuButton.addEventListener('click',function(){mobileMenu.classList.toggle('open')})}
qsa('[data-search]').forEach(function(input){
input.addEventListener('input',function(){
var key=input.value.trim().toLowerCase();
var root=input.closest('main')||document;
qsa('.movie-card',root).forEach(function(card){
var text=((card.getAttribute('data-title')||'')+' '+(card.getAttribute('data-meta')||'')+' '+card.textContent).toLowerCase();
card.hidden=key&&text.indexOf(key)===-1;
});
});
});
var carousel=qs('[data-hero-carousel]');
if(carousel){
var slides=qsa('.hero-slide',carousel),dots=qsa('[data-hero-dot]',carousel),current=0,timer;
function show(i){if(!slides.length)return;current=(i+slides.length)%slides.length;slides.forEach(function(s,n){s.classList.toggle('active',n===current)});dots.forEach(function(d,n){d.classList.toggle('active',n===current)})}
function play(){clearInterval(timer);timer=setInterval(function(){show(current+1)},5200)}
dots.forEach(function(dot){dot.addEventListener('click',function(){show(parseInt(dot.getAttribute('data-hero-dot'),10)||0);play()})});
show(0);play();
}
})();
function initMoviePlayer(id,source){
var video=document.getElementById(id);if(!video)return;
var shell=video.closest('.player-shell');var overlay=shell?shell.querySelector('[data-play-overlay]'):null;var loaded=false;
function load(){
if(loaded)return;loaded=true;
if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=source}
else if(window.Hls&&window.Hls.isSupported()){var hls=new window.Hls({lowLatencyMode:true});hls.loadSource(source);hls.attachMedia(video);video._hls=hls}
else{video.src=source}
}
function start(){load();video.controls=true;if(overlay)overlay.classList.add('hidden');var p=video.play();if(p&&p.catch)p.catch(function(){})}
if(overlay)overlay.addEventListener('click',start);
video.addEventListener('click',function(){if(video.paused)start()});
}