/* --- Parallax Scroll (Optimized) --- */
const parallaxBg = document.querySelector('.parallax-bg');
if (parallaxBg) {
    let ticking = false;
    const updateParallax = () => {
        parallaxBg.style.transform = `translateY(${window.pageYOffset * 0.5}px)`;
        ticking = false;
    };
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }, { passive: true });
}

/* --- Scroll Animations --- */
const elementsToAnimate = document.querySelectorAll('.fade-in, .slide-in, .section-title');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });
elementsToAnimate.forEach(el => observer.observe(el));

/* --- Counter Animation --- */
const customerCounter = document.getElementById('customers-count');
if (customerCounter) {
    let count = 0;
    const targetCount = 10000;
    const speed = 100;
    const updateCounter = () => {
        if (count < targetCount) {
            count += Math.ceil(targetCount / speed);
            if (count > targetCount) count = targetCount;
            customerCounter.innerText = count.toLocaleString();
            setTimeout(updateCounter, 10);
        } else {
            customerCounter.innerText = targetCount.toLocaleString() + '+';
        }
    };
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                updateCounter();
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    counterObserver.observe(customerCounter);
}

/* --- Star Rating --- */
const stars = document.querySelectorAll('.star-rating .star');
let currentRating = 0;
if (stars.length > 0) {
    stars.forEach(star => {
        star.addEventListener('click', (e) => {
            currentRating = parseInt(e.target.dataset.value);
            updateStars();
        });
        star.addEventListener('mouseover', (e) => {
            const value = parseInt(e.target.dataset.value);
            stars.forEach(s => {
                s.classList.toggle('active', s.dataset.value <= value);
            });
        });
        star.addEventListener('mouseout', () => updateStars());
    });
}

function updateStars() {
    stars.forEach(s => {
        s.classList.toggle('active', s.dataset.value <= currentRating);
    });
}

/* --- Review Submission --- */
const reviewForm = document.getElementById('review-submission-form');
const reviewList = document.getElementById('review-list');

// Load saved reviews
window.addEventListener('DOMContentLoaded', () => {
    if (reviewList) {
        const savedReviews = JSON.parse(localStorage.getItem('reviews')) || [];
        savedReviews.forEach(review => addReviewToDOM(review.name, review.text, review.rating));
    }
});

// Submit Review
if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('review-name').value.trim();
        const text = document.getElementById('review-text').value.trim();
        if (name && text && currentRating > 0) {
            addReviewToDOM(name, text, currentRating);
            const existingReviews = JSON.parse(localStorage.getItem('reviews')) || [];
            existingReviews.unshift({ name, text, rating: currentRating });
            localStorage.setItem('reviews', JSON.stringify(existingReviews));
            reviewForm.reset();
            currentRating = 0;
            updateStars();
            alert('Thank you for your review!');
        } else {
            alert('Please fill out all fields and provide a rating.');
        }
    });
}

function addReviewToDOM(name, text, rating) {
    if (!reviewList) return;
    const reviewCard = document.createElement('div');
    reviewCard.classList.add('review-card', 'fade-in');
    const starsHtml = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    reviewCard.innerHTML = `
        <div class="stars">${starsHtml}</div>
        <p class="review-text">"${text}"</p>
        <p class="reviewer-name">- ${name}</p>
    `;
    reviewList.prepend(reviewCard);
    setTimeout(() => reviewCard.classList.add('active'), 10);
}

/* --- Mobile Menu Toggle --- */
const mobileMenu = document.getElementById('mobile-menu');
const navList = document.querySelector('nav ul');

if (mobileMenu && navList) {
    mobileMenu.addEventListener('click', () => {
        navList.classList.toggle('showing');
        const icon = mobileMenu.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        }
    });
}

/* --- Mobile Contact Interactions (Optimized) --- */
const contactItems = document.querySelectorAll('.contact-item');
if (contactItems.length > 0) {
    contactItems.forEach(item => {
        let touchTimeout;
        item.addEventListener('touchstart', function() {
            this.classList.add('touch-active');
            clearTimeout(touchTimeout);
        }, { passive: true });
        
        item.addEventListener('touchend', function() {
            touchTimeout = setTimeout(() => {
                this.classList.remove('touch-active');
            }, 150);
        }, { passive: true });
    });
}

// Close mobile menu when clicking on a link
if (navList) {
    const navLinks = navList.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navList.classList.remove('showing');
            if (mobileMenu) {
                const icon = mobileMenu.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                }
            }
        });
    });
}
