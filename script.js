
// Your Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyAFiYdI-Ln-Q0mkLbjmWBt588dAhH2-wWc",
    authDomain: "portfolio-3a15c.firebaseapp.com",
    projectId: "portfolio-3a15c",
    storageBucket: "portfolio-3a15c.firebasestorage.app",
    messagingSenderId: "611011761470",
    appId: "1:611011761470:web:4f64c68a8f7c36a307886f",
    measurementId: "G-3LC9YC275V" // Optional, if you're not using Analytics
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(); // Get a reference to the Firestore database

// --- All your existing JavaScript code (for theme toggle, smooth scrolling, animations, etc.) ---
document.getElementById('current-year').textContent = new Date().getFullYear();

const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const currentTheme = localStorage.getItem('theme');

// Function to set the initial theme based on localStorage or default to dark
function setInitialTheme() {
    if (currentTheme) {
        body.classList.add(currentTheme);
        if (currentTheme === 'dark-mode') {
            themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        } else {
            themeToggle.querySelector('i').classList.replace('fa-sun', 'fa-moon');
        }
    } else {
        // If no theme is saved in localStorage, default to dark-mode
        body.classList.add('dark-mode');
        themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun'); // Set icon to sun (to toggle to light)
    }
}

setInitialTheme(); // Call the function on load

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    let theme = 'light-mode';

    if (body.classList.contains('dark-mode')) {
        themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        theme = 'dark-mode';
    } else {
        themeToggle.querySelector('i').classList.replace('fa-sun', 'fa-moon');
        theme = 'light-mode';
    }

    localStorage.setItem('theme', theme);
});

// Smooth scrolling for navigation links
document.querySelectorAll('a.scroll-link').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Intersection Observer for scroll-triggered animations
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.animated-element');

    const observerOptions = {
        root: null, // use the viewport as the root
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const animationClasses = el.className.split(' ').filter(cls => cls.startsWith('animation-'));
                animationClasses.forEach(cls => {
                    el.classList.add(cls.replace('animation-', 'animate-')); // Convert e.g., 'animation-fade-in-up' to 'animate-fade-in-up'
                });

                const delayMatch = el.className.match(/animation-delay-(\d+)/);
                if (delayMatch && delayMatch[1]) {
                    el.style.animationDelay = `${delayMatch[1]}ms`;
                }
                el.classList.add('is-visible'); // Add a class to make it visible and trigger animation
                observer.unobserve(el); // Stop observing once animated
            }
        });
    }, observerOptions);

    animatedElements.forEach(element => {
        observer.observe(element);
    });

    // Special handling for Hero section elements (animate immediately on load)
    const heroElements = document.querySelectorAll('#hero .animated-element');
    heroElements.forEach(el => {
        const animationClasses = el.className.split(' ').filter(cls => cls.startsWith('animation-'));
        animationClasses.forEach(cls => {
            el.classList.add(cls.replace('animation-', 'animate-'));
        });
        const delayMatch = el.className.match(/animation-delay-(\d+)/);
        if (delayMatch && delayMatch[1]) {
            el.style.animationDelay = `${delayMatch[1]}ms`;
        }
        el.classList.add('is-visible');
    });

    // --- Rating System JavaScript (Firebase Integrated) ---

    const starRatingContainer = document.getElementById('starRating');
    const starIcons = starRatingContainer.querySelectorAll('.star-icon');
    const selectedRatingInput = document.getElementById('selectedRating');
    const ratingForm = document.getElementById('ratingForm');
    const ratingFormMessage = document.getElementById('ratingFormMessage');
    // Ensure this ID matches the HTML element EXACTLY
    const testimonialsContainer = document.getElementById('testimonialsContainer');
    const totalReviewsCountSpan = document.getElementById('totalReviewsCount');

    let currentRating = 0; // To store the user's selected rating

    // Handle star hover effect
    starIcons.forEach(star => {
        star.addEventListener('mouseover', () => {
            const ratingValue = parseInt(star.dataset.rating);
            fillStars(ratingValue, 'fas', 'far'); // Removed color class here, handled by CSS
        });

        star.addEventListener('mouseout', () => {
            fillStars(currentRating, 'fas', 'far'); // Revert to selected rating, color handled by CSS
        });

        star.addEventListener('click', () => {
            currentRating = parseInt(star.dataset.rating);
            selectedRatingInput.value = currentRating;
            fillStars(currentRating, 'fas', 'far'); // Permanently fill selected stars, color handled by CSS
        });
    });

    function fillStars(rating, filledClass, emptyClass) {
        starIcons.forEach(star => {
            const starValue = parseInt(star.dataset.rating);
            if (starValue <= rating) {
                star.classList.remove(emptyClass);
                star.classList.add(filledClass);
            } else {
                star.classList.remove(filledClass);
                star.classList.add(emptyClass);
            }
        });
    }

    // Handle review form submission
    ratingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const reviewerName = document.getElementById('reviewerName').value.trim();
        const ratingMessage = document.getElementById('ratingMessage').value.trim();
        const selectedRating = parseInt(selectedRatingInput.value);

        if (selectedRating === 0) {
            displayFormMessage("Please select a star rating.", 'text-red-500');
            return;
        }

        if (!reviewerName) {
            displayFormMessage("Please enter your name.", 'text-red-500');
            return;
        }

        // Send data to Firebase Firestore
        try {
            await db.collection("reviews").add({
                name: reviewerName,
                rating: selectedRating,
                message: ratingMessage,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                verified: false // New field: default to unverified
            });
            displayFormMessage("Thank you for your review! It will appear shortly.", 'text-accent-green');
            ratingForm.reset();
            currentRating = 0;
            selectedRatingInput.value = "0";
            fillStars(0, 'fas', 'far'); // Reset stars, color handled by CSS
            loadTestimonials(); // Reload testimonials to show the new one
        } catch (error) {
            console.error("Error adding document: ", error);
            displayFormMessage("Error submitting review. Please try again.", 'text-red-500');
        }
    });

    function displayFormMessage(message, colorClass) {
        ratingFormMessage.textContent = message;
        ratingFormMessage.className = `mt-4 text-center text-lg ${colorClass}`; // Reset classes and apply new
        ratingFormMessage.classList.remove('hidden');
        setTimeout(() => {
            ratingFormMessage.classList.add('hidden');
        }, 5000); // Hide message after 5 seconds
    }

    // Function to load and display testimonials from Firebase
    async function loadTestimonials() {
        try {
            const snapshot = await db.collection("reviews").orderBy("timestamp", "desc").get();
            testimonialsContainer.innerHTML = ''; // Clear existing testimonials
            let totalRating = 0;
            let reviewCount = 0;

            snapshot.forEach(doc => {
                const review = doc.data();
                totalRating += review.rating;
                reviewCount++;

                const starsHtml = generateStarsHtml(review.rating);
                const isVerified = review.verified || false;
                const verificationClass = isVerified ? 'text-green-500' : 'text-gray-400';
                const verificationTooltipText = isVerified ? "Verified" : "Not Verified";
                const verificationTooltipClass = isVerified ? 'is-verified' : '';
                // const nameColor = body.classList.contains('dark-mode') ? 'var(--color-gold-accent)' : 'var(--color-light-green-accent)';
                // reviewHtml = reviewHtml.replace('var(--name-color)', nameColor);

                const reviewHtml = `
                        <div class="card-minecraft p-6 rounded-lg text-left animated-element animation-fade-in-up"
                            data-review-id="${doc.id}">
                            <div class="flex justify-between items-center mb-4">
                                <div class="flex text-xl">
                                    ${starsHtml}
                                </div>
                                <div class="relative inline-block">
                                    <i class="fas fa-circle-check ${verificationClass} text-2xl cursor-pointer verification-badge"
                                        data-verified="${isVerified}" data-review-id="${doc.id}"></i>
                                    <span class="verification-tooltip absolute px-3 py-1 text-sm rounded-md shadow-lg font-inter whitespace-nowrap ${verificationTooltipClass}">
                                        ${verificationTooltipText}
                                    </span>
                                </div>
                            </div>
                            <p class="font-inter italic mb-4">"${review.message}"</p>
                            <p class="font-press-start" style="color: var(--name-color);">- ${review.name} ${isVerified ? '(Verified)' : ''}</p>
                        </div>
                    `;

                // Create a temporary div to parse the HTML string into a DOM element
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = reviewHtml.trim();
                const reviewCard = tempDiv.firstChild; // Get the actual div element

                testimonialsContainer.appendChild(reviewCard); // Append the new element

                // Manually trigger animation for newly added review card
                // This applies the 'is-visible' class which changes opacity from 0 to 1
                setTimeout(() => {
                    reviewCard.classList.add('is-visible');
                    // Also apply delay if defined in the class (e.g., animation-delay-200)
                    const delayMatch = reviewCard.className.match(/animation-delay-(\d+)/);
                    if (delayMatch && delayMatch[1]) {
                        reviewCard.style.animationDelay = `${delayMatch[1]}ms`;
                    }
                }, 50); // Small delay to allow DOM to render before adding class
            });

            // Calculate and display overall rating
            const overallRating = reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : "0.0";
            document.querySelector('#testimonials .text-5xl span').textContent = `${overallRating}/5.0`;
            totalReviewsCountSpan.textContent = reviewCount;

            // Re-initialize verification badge logic for newly added elements
            initializeVerificationBadges();

        } catch (error) {
            console.error("Error loading testimonials: ", error);
        }
    }

    // Helper to generate star HTML
    function generateStarsHtml(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="fas fa-star star-icon"></i>'; // Removed color class, now handled by CSS
            } else if (i - 0.5 === rating) { // For half stars
                stars += '<i class="fas fa-star-half-alt star-icon"></i>'; // Removed color class, now handled by CSS
            } else {
                stars += '<i class="far fa-star star-icon"></i>'; // Removed color class, now handled by CSS
            }
        }
        return stars;
    }

    // Call loadTestimonials when the page loads
    loadTestimonials();

    // --- Verification Badge JavaScript (modified to handle dynamic content) ---
    const verificationPassword = "something@123"; // Your secret password (consider more secure methods for production)

    function initializeVerificationBadges() {
        const verificationBadges = document.querySelectorAll('.verification-badge');

        verificationBadges.forEach(badge => {
            // Remove existing event listeners to prevent duplicates (simple method for dynamic content)
            // This approach of cloning can be problematic with animations/observers.
            // For now, we keep it as it's part of your existing logic for verification.
            // A more robust solution for dynamic content would be event delegation.
            const newBadge = badge.cloneNode(true);
            badge.parentNode.replaceChild(newBadge, badge);

            const tooltip = newBadge.nextElementSibling;

            function updateTooltipText(isVerified) {
                if (tooltip) {
                    tooltip.textContent = isVerified ? "Verified" : "Not Verified";
                    if (isVerified) {
                        tooltip.classList.add('is-verified');
                    } else {
                        tooltip.classList.remove('is-verified');
                    }
                }
            }

            updateTooltipText(newBadge.dataset.verified === 'true');

            newBadge.addEventListener('mouseover', () => {
                if (tooltip) {
                    updateTooltipText(newBadge.dataset.verified === 'true');
                    tooltip.classList.remove('hidden');
                    tooltip.style.opacity = '1';
                    tooltip.style.pointerEvents = 'auto';
                }
            });

            newBadge.addEventListener('mouseout', () => {
                if (tooltip) {
                    tooltip.style.opacity = '0';
                    tooltip.style.pointerEvents = 'none';
                }
            });

            newBadge.addEventListener('click', async () => {
                const currentStatus = newBadge.dataset.verified === 'true';
                // Corrected: dataset properties with hyphens are camel-cased in JS
                const reviewId = newBadge.dataset.reviewId;
                const promptText = currentStatus ? "Enter password to unverify this review:" : "Enter password to verify this review:";
                const inputPassword = prompt(promptText);

                if (inputPassword === verificationPassword) {
                    const newStatus = !currentStatus;
                    try {
                        await db.collection("reviews").doc(reviewId).update({
                            verified: newStatus
                        });
                        newBadge.dataset.verified = newStatus;
                        if (newStatus) {
                            newBadge.classList.remove('text-gray-400');
                            newBadge.classList.add('text-green-500');
                            alert("Review marked as VERIFIED!");
                        } else {
                            newBadge.classList.remove('text-green-500');
                            newBadge.classList.add('text-gray-400');
                            alert("Review marked as UNVERIFIED!");
                        }
                        updateTooltipText(newStatus);
                        loadTestimonials(); // Reload testimonials to reflect changes
                    } catch (error) {
                        console.error("Error updating verification status: ", error);
                        alert("Error updating verification status.");
                    }
                } else if (inputPassword !== null) {
                    alert("Incorrect password.");
                }
            });
        });
    }

    // Initial call to set up the verification badges
    initializeVerificationBadges();
});