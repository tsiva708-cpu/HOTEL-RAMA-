const parallaxBg = document.querySelector('.parallax-bg');
if (parallaxBg) {
    window.addEventListener('scroll', () => {
        const scrollPosition = window.pageYOffset;
        parallaxBg.style.transform = `translateY(${scrollPosition * 0.5}px)`;
    });
}

const elementsToAnimate = document.querySelectorAll('.fade-in, .slide-in, .section-title');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1
});

elementsToAnimate.forEach(el => observer.observe(el));

// Mobile menu
const mobileMenuBtn = document.getElementById('mobile-menu');
const navList = document.getElementById('primary-navigation');

const setMenuOpen = (open) => {
    if (!mobileMenuBtn || !navList) return;
    navList.classList.toggle('showing', open);
    mobileMenuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    const icon = mobileMenuBtn.querySelector('i');
    if (icon) {
        icon.classList.toggle('fa-bars', !open);
        icon.classList.toggle('fa-times', open);
    }
};

if (mobileMenuBtn && navList) {
    mobileMenuBtn.addEventListener('click', () => {
        const isOpen = navList.classList.contains('showing');
        setMenuOpen(!isOpen);
    });

    // Close menu when clicking a link
    navList.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => setMenuOpen(false));
    });

    // Close on outside click (mobile only)
    document.addEventListener('click', (e) => {
        if (window.matchMedia('(max-width: 768px)').matches) {
            const clickedInside = mobileMenuBtn.contains(e.target) || navList.contains(e.target);
            if (!clickedInside) setMenuOpen(false);
        }
    });
}

const customerCounter = document.getElementById('customers-count');
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

if (customerCounter) {
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                updateCounter();
                counterObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });

    counterObserver.observe(customerCounter);
}

const stars = document.querySelectorAll('.star-rating .star');
let currentRating = 0;

stars.forEach(star => {
    star.addEventListener('click', (e) => {
        const value = parseInt(e.target.dataset.value);
        currentRating = value;
        updateStars();
    });

    star.addEventListener('mouseover', (e) => {
        const value = parseInt(e.target.dataset.value);
        stars.forEach(s => {
            s.classList.toggle('active', s.dataset.value <= value);
        });
    });
    star.addEventListener('mouseout', () => {
        updateStars();
    });
});

const updateStars = () => {
    stars.forEach(s => {
        s.classList.toggle('active', s.dataset.value <= currentRating);
    });
};

const reviewForm = document.getElementById('review-submission-form');
const reviewList = document.getElementById('review-list');

const firebaseConfig = {
    apiKey: "AIzaSyDQ3BbrZfAbYZRtrQA_9adWKa61NKYrxdk",
    authDomain: "hotel-rama.firebaseapp.com",
    databaseURL: "https://hotel-rama-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "hotel-rama",
    storageBucket: "hotel-rama.firebasestorage.app",
    messagingSenderId: "251878581974",
    appId: "1:251878581974:web:0eb3eb498e97bba37b0b77",
    measurementId: "G-DH58P52CJR"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const reviewsRef = db.collection("reviews");

const addReviewCard = (name, reviewText, rating) => {
    if (!reviewList) return;

    const newReview = document.createElement('div');
    newReview.classList.add('review-card', 'fade-in');
    const starsHtml = '★'.repeat(rating);

    newReview.innerHTML = `
        <div class="stars">${starsHtml}</div>
        <p class="review-text">"${reviewText}"</p>
        <p class="reviewer-name">- ${name}</p>
    `;

    reviewList.prepend(newReview);
    setTimeout(() => newReview.classList.add('active'), 10);
};

const loadReviewsFromFirestore = async () => {
    if (!reviewList) return;
    try {
        const snapshot = await reviewsRef.orderBy("createdAt", "desc").get();
        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data?.name && data?.text && data?.rating) {
                addReviewCard(data.name, data.text, data.rating);
            }
        });
    } catch (error) {
        console.error("Failed to load reviews:", error);
    }
};

if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('review-name').value.trim();
        const reviewText = document.getElementById('review-text').value.trim();

        if (!name || !reviewText || currentRating <= 0) {
            alert('Please fill out all fields and provide a rating.');
            return;
        }

        try {
            await reviewsRef.add({
                name: name,
                text: reviewText,
                rating: currentRating,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            addReviewCard(name, reviewText, currentRating);
            reviewForm.reset();
            currentRating = 0;
            updateStars();
            alert('Thank you for your review!');
        } catch (error) {
            console.error("Failed to save review:", error);
            alert('Unable to save your review right now. Please try again.');
        }
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadReviewsFromFirestore);
} else {
    loadReviewsFromFirestore();
}