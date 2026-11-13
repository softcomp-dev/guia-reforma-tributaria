const sidebar = document.getElementById('sidebar');
const mobileMenuButton = document.getElementById('mobileMenuButton');
mobileMenuButton.addEventListener('click',()=>sidebar.classList.toggle('open'));
document.querySelectorAll('.sidebar a').forEach(link=>{
  link.addEventListener('click',()=>sidebar.classList.remove('open'));
});

const links = [...document.querySelectorAll('.sidebar a[href^="#"]')];
const sections = [...document.querySelectorAll('section[id]')];
const observer = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      links.forEach(link=>link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    }
  });
},{rootMargin:'-25% 0px -65% 0px',threshold:0});
sections.forEach(section=>observer.observe(section));
