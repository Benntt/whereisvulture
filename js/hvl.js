document.addEventListener('DOMContentLoaded', () => {
  const preview = document.getElementById('hover-preview');
  const items = document.querySelectorAll('.hvl-list li');

  items.forEach(item => {
    const imgSrc = item.getAttribute('data-img');

    item.addEventListener('mouseenter', () => {
      preview.src = imgSrc;
      preview.style.display = 'block';
    });

    item.addEventListener('mousemove', (e) => {
      preview.style.top = `${e.clientY + 20}px`;
      preview.style.left = `${e.clientX + 20}px`;
    });

    item.addEventListener('mouseleave', () => {
      preview.style.display = 'none';
    });
  });
});
