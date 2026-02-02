const track = document.querySelector('.carousel-track');
const slides = Array.from(track.children);
const nextButton = document.querySelector('.carousel-btn.next-btn');
const prevButton = document.querySelector('.carousel-btn.prev-btn');

const slideWidth = slides[0].getBoundingClientRect().width;

// Arrange the slides next to one another
const setSlidePosition = (slide, index) => {
    slide.style.left = slideWidth * index + 'px';
};
slides.forEach(setSlidePosition);

const moveToSlide = (track, currentSlide, targetSlide) => {
    track.style.transform = 'translateX(-' + targetSlide.style.left + ')';
    currentSlide.classList.remove('current-slide');
    targetSlide.classList.add('current-slide');

    // Update button visibility (optional loop logic here, but let's keep it simple first)
};

// Next button
nextButton.addEventListener('click', e => {
    const currentSlide = track.querySelector('.current-slide');
    const nextSlide = currentSlide.nextElementSibling || slides[0]; // Loop back to start

    moveToSlide(track, currentSlide, nextSlide);
});

// Prev button
prevButton.addEventListener('click', e => {
    const currentSlide = track.querySelector('.current-slide');
    const prevSlide = currentSlide.previousElementSibling || slides[slides.length - 1]; // Loop to end

    moveToSlide(track, currentSlide, prevSlide);
});

// Handle resize
window.addEventListener('resize', () => {
    const newSlideWidth = slides[0].getBoundingClientRect().width;
    slides.forEach((slide, index) => {
        slide.style.left = newSlideWidth * index + 'px';
    });
    const currentSlide = track.querySelector('.current-slide');
    track.style.transition = 'none';
    track.style.transform = 'translateX(-' + currentSlide.style.left + ')';
    setTimeout(() => {
        track.style.transition = 'transform 0.4s ease-in-out';
    }, 50);
});
