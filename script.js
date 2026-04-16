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

const loadExternalScript = (src) => new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
        if (existing.dataset.loaded === "true") {
            resolve();
            return;
        }

        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    script.addEventListener("load", () => {
        script.dataset.loaded = "true";
        resolve();
    }, { once: true });
    script.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
    document.body.appendChild(script);
});

const reviewForm = document.getElementById('review-submission-form');
const reviewList = document.getElementById('review-list');
const reviewsSection = document.getElementById('reviews');
const featuredGoogleReviews = [
    {
        name: "A. Kumar",
        text: "Good taste, quick service, and value for money. Their biryani and meals are very satisfying.",
        rating: 5
    },
    {
        name: "S. Fathima",
        text: "Clean place and friendly staff. Nice spot for family lunch when visiting Arumuganeri.",
        rating: 4
    },
    {
        name: "R. Prakash",
        text: "Tasty South Indian food with good portions. Service was fast even during busy time.",
        rating: 4
    }
];

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

let reviewsRef = null;
let reviewsBootPromise = null;
let featuredReviewsLoaded = false;

const bootReviews = async () => {
    if (!reviewList || !reviewsSection) return null;
    if (reviewsBootPromise) return reviewsBootPromise;

    reviewsBootPromise = (async () => {
        await loadExternalScript("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
        await loadExternalScript("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js");

        if (!window.firebase) {
            throw new Error("Firebase did not load");
        }

        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        const db = firebase.firestore();
        reviewsRef = db.collection("reviews");

        if (!featuredReviewsLoaded) {
            loadFeaturedGoogleReviews();
            featuredReviewsLoaded = true;
        }

        await loadReviewsFromFirestore();
        return reviewsRef;
    })().catch((error) => {
        reviewsBootPromise = null;
        console.error("Failed to initialize reviews:", error);
        return null;
    });

    return reviewsBootPromise;
};

const createReviewCard = ({ name, reviewText, rating, source }) => {
    const safeRating = Math.max(1, Math.min(5, Number(rating) || 1));

    const newReview = document.createElement('div');
    newReview.classList.add('review-card', 'fade-in');

    const reviewTop = document.createElement('div');
    reviewTop.classList.add('review-top');

    const stars = document.createElement('div');
    stars.classList.add('stars');
    stars.textContent = '★'.repeat(safeRating);

    const sourceBadge = document.createElement('span');
    sourceBadge.classList.add(
        'review-source-badge',
        source === 'Google' ? 'source-google' : 'source-website'
    );
    sourceBadge.textContent = source;

    reviewTop.append(stars, sourceBadge);

    const reviewTextElement = document.createElement('p');
    reviewTextElement.classList.add('review-text');
    reviewTextElement.textContent = `"${reviewText}"`;

    const reviewerName = document.createElement('p');
    reviewerName.classList.add('reviewer-name');
    reviewerName.textContent = `- ${name}`;

    newReview.append(reviewTop, reviewTextElement, reviewerName);
    return newReview;
};

const addReviewCard = (name, reviewText, rating, source = "Website", prepend = false) => {
    if (!reviewList) return;
    const newReview = createReviewCard({ name, reviewText, rating, source });
    if (prepend) {
        reviewList.prepend(newReview);
    } else {
        reviewList.append(newReview);
    }
    setTimeout(() => newReview.classList.add('active'), 10);
};

const loadFeaturedGoogleReviews = () => {
    featuredGoogleReviews.forEach((review) => {
        addReviewCard(review.name, review.text, review.rating, "Google");
    });
};

const loadReviewsFromFirestore = async () => {
    if (!reviewList || !reviewsRef) return;
    try {
        const snapshot = await reviewsRef.orderBy("createdAt", "desc").get();
        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data?.name && data?.text && data?.rating) {
                addReviewCard(data.name, data.text, data.rating, "Website");
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
            const readyReviewsRef = await bootReviews();
            if (!readyReviewsRef) {
                alert('Unable to connect right now. Please try again.');
                return;
            }

            await reviewsRef.add({
                name: name,
                text: reviewText,
                rating: currentRating,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            addReviewCard(name, reviewText, currentRating, "Website", true);
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

if (reviewsSection) {
    const reviewLoader = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                bootReviews();
                reviewLoader.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: "250px 0px",
        threshold: 0.05
    });

    reviewLoader.observe(reviewsSection);
}








function autoScrollWithPause(containerSelector, options = {}) {
    const container = document.querySelector(containerSelector);
    if (!container || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (container.dataset.autoScrollReady === "true") return;

    const items = Array.from(container.children);
    if (items.length < 2) return;

    const {
        delay = 4200,
        resetDelay = 700,
        cloneCount = 1
    } = options;

    const clonesToAdd = Math.min(cloneCount, items.length);
    for (let i = 0; i < clonesToAdd; i += 1) {
        const clone = items[i].cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        clone.classList.add("menu-clone");
        container.appendChild(clone);
    }

    const getSlides = () => Array.from(container.children);
    let currentIndex = 0;
    let autoScrollInterval;
    let resetTimeout;

    const stopAutoScroll = () => {
        clearInterval(autoScrollInterval);
        clearTimeout(resetTimeout);
        autoScrollInterval = null;
        resetTimeout = null;
    };

    const scrollToSlide = (index, behavior = "smooth") => {
        const slides = getSlides();
        const target = slides[index];
        if (!target) return;

        container.scrollTo({
            left: target.offsetLeft,
            behavior
        });
    };

    const stepForward = () => {
        const originalCount = items.length;
        currentIndex += 1;
        scrollToSlide(currentIndex);

        if (currentIndex >= originalCount) {
            resetTimeout = window.setTimeout(() => {
                container.scrollTo({ left: 0, behavior: "auto" });
                currentIndex = 0;
            }, resetDelay);
        }
    };

    const startAutoScroll = () => {
        if (autoScrollInterval) return;
        autoScrollInterval = window.setInterval(stepForward, delay);
    };

    container.addEventListener("touchstart", stopAutoScroll, { passive: true });
    container.addEventListener("mouseenter", stopAutoScroll);
    container.addEventListener("focusin", stopAutoScroll);

    container.addEventListener("touchend", startAutoScroll);
    container.addEventListener("mouseleave", startAutoScroll);
    container.addEventListener("focusout", startAutoScroll);

    container.dataset.autoScrollReady = "true";
    startAutoScroll();
}

// Apply to both
autoScrollWithPause(".food-gallery", { cloneCount: 1 });
autoScrollWithPause(".menu-grid", { cloneCount: 2 });
