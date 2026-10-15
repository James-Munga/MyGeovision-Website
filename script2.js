
/* MYGEOVISION - Main JavaScript */

document.addEventListener("DOMContentLoaded", () => {

    const menuButton = document.querySelector(".menu-button");
    const mobileMenu = document.querySelector(".mobile-menu");
    const navbar = document.querySelector(".navbar");

    const processStages =
        document.querySelectorAll(".process-stage");

    const revealElements =
        document.querySelectorAll(
            ".reveal-left, .reveal-right, .reveal-up"
        );

    const homeLink =
        document.querySelector('.nav-pill a[href="#home"]');

    const navLinks =
        document.querySelectorAll(".nav-pill a");


    /* Mobile Navigation */

    if (menuButton && mobileMenu) {

        menuButton.addEventListener("click", () => {

            const isOpen =
                mobileMenu.classList.toggle("is-open");

            menuButton.classList.toggle(
                "is-open",
                isOpen
            );

            menuButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            document.body.classList.toggle(
                "menu-open",
                isOpen
            );

        });


        mobileMenu.querySelectorAll("a").forEach(link => {

            link.addEventListener("click", () => {

                mobileMenu.classList.remove("is-open");
                menuButton.classList.remove("is-open");

                menuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

                document.body.classList.remove("menu-open");

            });

        });

    }


    /* Scroll Reveal */

    if ("IntersectionObserver" in window) {

        const revealObserver =
            new IntersectionObserver(
                (entries, observer) => {

                    entries.forEach(entry => {

                        if (entry.isIntersecting) {

                            entry.target.classList.add("visible");

                            observer.unobserve(
                                entry.target
                            );

                        }

                    });

                },
                {
                    threshold: 0.15,
                    rootMargin: "0px 0px -60px 0px"
                }
            );


        revealElements.forEach(element => {

            revealObserver.observe(element);

        });

    } else {

        revealElements.forEach(element => {

            element.classList.add("visible");

        });

    }


    /* Parallax */

    function updateParallax() {

        if (
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches
        ) {
            return;
        }


        processStages.forEach(stage => {

            const image =
                stage.querySelector(".stage-media img");

            if (!image) return;

            const rect =
                stage.getBoundingClientRect();

            const center =
                rect.top + rect.height / 2;

            const distance =
                center - window.innerHeight / 2;

            const movement =
                Math.max(
                    -15,
                    Math.min(
                        15,
                        distance * -0.015
                    )
                );


            image.style.setProperty(
                "--parallax",
                `${movement}px`
            );

        });

    }


    window.addEventListener(
        "scroll",
        updateParallax,
        { passive: true }
    );

    window.addEventListener(
        "resize",
        updateParallax
    );

    updateParallax();


    /* Navbar */

    function updateNavbar() {

        if (!navbar) return;

        navbar.classList.toggle(
            "scrolled",
            window.scrollY > 50
        );

    }


    window.addEventListener(
        "scroll",
        updateNavbar,
        { passive: true }
    );

    updateNavbar();


    /* Stage Hover */

    processStages.forEach(stage => {

        const media =
            stage.querySelector(".stage-media");

        if (!media) return;


        stage.addEventListener(
            "mousemove",
            event => {

                if (window.innerWidth < 760) return;

                const rect =
                    media.getBoundingClientRect();

                const x =
                    event.clientX - rect.left;

                const y =
                    event.clientY - rect.top;

                const rotateX =
                    ((y / rect.height) - 0.5) * -2;

                const rotateY =
                    ((x / rect.width) - 0.5) * 2;


                media.style.transform =
                    `
                    perspective(1000px)
                    rotateX(${rotateX}deg)
                    rotateY(${rotateY}deg)
                    `;

            }
        );


        stage.addEventListener(
            "mouseleave",
            () => {

                media.style.transform =
                    "perspective(1000px) rotateX(0deg) rotateY(0deg)";

            }
        );

    });


    /* Navigation */

    function setActiveNav(link) {

        navLinks.forEach(item => {

            item.classList.remove("active");

        });


        if (link) {

            link.classList.add("active");

        }

    }


/* =====================================================
   HOME PAGE NAVIGATION
===================================================== */

if (homeLink) {

    homeLink.addEventListener(
        "click",
        event => {

            /*
             * Only intercept Home when already
             * on index.html.
             */
            const currentPage =
                window.location.pathname
                    .split("/")
                    .pop()
                    .toLowerCase();


            if (
                currentPage === "index.html" ||
                currentPage === ""
            ) {

                event.preventDefault();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });


                setActiveNav(homeLink);


                window.history.replaceState(
                    null,
                    "",
                    "index.html#home"
                );

            }

        }
    );

}

    /* Internal Links */

    navLinks.forEach(link => {

        const href =
            link.getAttribute("href");


        if (
            !href ||
            href === "#" ||
            href === "#home" ||
            !href.startsWith("#")
        ) {
            return;
        }


        link.addEventListener(
            "click",
            event => {

                const target =
                    document.querySelector(href);

                if (!target) return;

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

                setActiveNav(link);

                window.history.replaceState(
                    null,
                    "",
                    href
                );

            }
        );

    });


 

/* =====================================================
   PAGE-BASED ACTIVE NAVIGATION
===================================================== */

function getCurrentPage() {

    let page =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();

    if (!page) {
        page = "index.html";
    }

    return page;
}


function getLinkPage(link) {

    if (!link) {
        return "";
    }

    const href =
        link.getAttribute("href");

    if (!href) {
        return "";
    }

    /*
     * Ignore section links such as #home.
     */
    if (href.startsWith("#")) {
        return "";
    }

    return href
        .split("#")[0]
        .split("?")[0]
        .split("/")
        .pop()
        .toLowerCase();
}


function setCurrentPageActive() {

    const currentPage =
        getCurrentPage();


    /*
     * First remove active from
     * all desktop and mobile links.
     */
    navLinks.forEach(link => {

        link.classList.remove(
            "active"
        );

        link.removeAttribute(
            "aria-current"
        );

    });


    /*
     * Then activate the link matching
     * the current HTML page.
     */
    navLinks.forEach(link => {

        const linkPage =
            getLinkPage(link);


        if (
            linkPage === currentPage ||
            (
                currentPage === "" &&
                linkPage === "index.html"
            )
        ) {

            link.classList.add(
                "active"
            );

            link.setAttribute(
                "aria-current",
                "page"
            );

        }

    });

}


/*
 * Run immediately when page loads.
 */
setCurrentPageActive();


    /* Images */

    const stageImages =
        document.querySelectorAll(
            ".stage-media img"
        );


    stageImages.forEach(image => {

        if (image.complete) {

            image.classList.add("loaded");

        } else {

            image.addEventListener(
                "load",
                () => {

                    image.classList.add("loaded");

                },
                { once: true }
            );

        }

    });


    /* Page Ready */

    document.body.classList.add("page-ready");

    activateHome();

});






document.addEventListener("DOMContentLoaded", () => {

    const menuButton =
        document.querySelector(".contact-menu-button");

    const mobileMenu =
        document.querySelector(".contact-mobile-menu");


    if (menuButton && mobileMenu) {

        menuButton.addEventListener("click", () => {

            const isOpen =
                mobileMenu.classList.toggle("open");

            menuButton.setAttribute(
                "aria-expanded",
                isOpen
            );

        });


        mobileMenu
            .querySelectorAll("a")
            .forEach(link => {

                link.addEventListener("click", () => {

                    mobileMenu.classList.remove("open");

                    menuButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                });

            });

    }


    const contactForm =
        document.getElementById("contactForm");

    const submitButton =
        document.getElementById("contactSubmit");

    const submitText =
        document.getElementById("contactSubmitText");

    const submitIcon =
        document.getElementById("contactSubmitIcon");

    const statusMessage =
        document.getElementById("contactFormStatus");


    if (!contactForm) {
        return;
    }


    emailjs.init({
        publicKey: "fwyn_05ptTSE07gnn"
    });


    contactForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            statusMessage.textContent = "";

            statusMessage.className =
                "contact-form-status";


            submitButton.classList.add("loading");

            submitText.textContent =
                "Sending Enquiry...";

            submitIcon.className =
                "fa-solid fa-spinner fa-spin";


            const templateParams = {

                name:
                    document.getElementById("name").value.trim(),

                email:
                    document.getElementById("email").value.trim(),

                phone:
                    document.getElementById("phone").value.trim(),

                service:
                    document.getElementById("service").value,

                location:
                    document.getElementById("location").value.trim(),

                message:
                    document.getElementById("message").value.trim(),

                time:
                    new Date().toLocaleString()

            };


            try {

                await emailjs.send(
                    "service_xlkiuxr",
                    "template_lgsscr7",
                    templateParams
                );


                statusMessage.textContent =
                    "Your enquiry has been sent successfully. We will get back to you soon.";

                statusMessage.classList.add(
                    "success"
                );


                submitButton.classList.remove(
                    "loading"
                );

                submitButton.classList.add(
                    "success"
                );


                submitText.textContent =
                    "Enquiry Sent Successfully";

                submitIcon.className =
                    "fa-solid fa-check";


                contactForm.reset();


                setTimeout(() => {

                    submitButton.classList.remove(
                        "success"
                    );

                    submitText.textContent =
                        "Send Project Enquiry";

                    submitIcon.className =
                        "fa-solid fa-arrow-right";

                }, 5000);


            } catch (error) {

                console.error(
                    "EmailJS Error:",
                    error
                );


                statusMessage.textContent =
                    "We could not send your enquiry right now. Please try again or contact us directly by email.";

                statusMessage.classList.add(
                    "error"
                );


                submitButton.classList.remove(
                    "loading"
                );


                submitText.textContent =
                    "Try Again";


                submitIcon.className =
                    "fa-solid fa-rotate-right";

            }

        }
    );


    const newsletterForm =
        document.getElementById("newsletterForm");

    const newsletterMessage =
        document.getElementById("newsletterMessage");


    if (newsletterForm && newsletterMessage) {

        newsletterForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                newsletterMessage.classList.add(
                    "show"
                );

                newsletterForm.reset();

            }
        );

    }

});



// ABOUT SECTION
/* =========================================================
   MYGEOVISION
   ABOUT PAGE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       MOBILE NAVIGATION
    ===================================================== */

    const menuButton =
        document.querySelector(".about-menu");

    const mobileNavigation =
        document.querySelector(
            ".about-mobile-navigation"
        );


    if (menuButton && mobileNavigation) {

        menuButton.addEventListener("click", () => {

            const open =
                mobileNavigation.classList.toggle(
                    "open"
                );

            menuButton.setAttribute(
                "aria-expanded",
                open
            );

        });


        mobileNavigation
            .querySelectorAll("a")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    () => {

                        mobileNavigation
                            .classList
                            .remove("open");

                        menuButton.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                    }
                );

            });

    }


    /* =====================================================
       TEAM CARD MOUSE MOVEMENT
    ===================================================== */

    const personCards =
        document.querySelectorAll(
            ".person-card"
        );


    if (
        window.matchMedia(
            "(pointer: fine)"
        ).matches
    ) {

        personCards.forEach(card => {

            const image =
                card.querySelector(
                    ".person-image img"
                );


            card.addEventListener(
                "mousemove",
                event => {

                    const rect =
                        card.getBoundingClientRect();


                    const x =
                        event.clientX -
                        rect.left;


                    const y =
                        event.clientY -
                        rect.top;


                    const rotateY =
                        ((x / rect.width) - 0.5) *
                        2.5;


                    const rotateX =
                        ((y / rect.height) - 0.5) *
                        -2.5;


                    card.style.transform =
                        `perspective(1000px)
                         rotateX(${rotateX}deg)
                         rotateY(${rotateY}deg)
                         translateY(-10px)`;


                    if (image) {

                        const moveX =
                            ((x / rect.width) - 0.5) *
                            10;


                        const moveY =
                            ((y / rect.height) - 0.5) *
                            10;


                        image.style.transform =
                            `scale(1.09)
                             translate(${moveX}px, ${moveY}px)`;

                    }

                }
            );


            card.addEventListener(
                "mouseleave",
                () => {

                    card.style.transform =
                        "";


                    if (image) {

                        image.style.transform =
                            "";

                    }

                }
            );

        });

    }


    /* =====================================================
       PARTNERSHIP CARD MOVEMENT
    ===================================================== */

    const partnerCards =
        document.querySelectorAll(
            ".partner-card"
        );


    if (
        window.matchMedia(
            "(pointer: fine)"
        ).matches
    ) {

        partnerCards.forEach(card => {

            const logo =
                card.querySelector(
                    ".partner-logo img"
                );


            card.addEventListener(
                "mousemove",
                event => {

                    const rect =
                        card.getBoundingClientRect();


                    const x =
                        event.clientX -
                        rect.left;


                    const y =
                        event.clientY -
                        rect.top;


                    const rotateY =
                        ((x / rect.width) - 0.5) *
                        2;


                    const rotateX =
                        ((y / rect.height) - 0.5) *
                        -2;


                    card.style.transform =
                        `perspective(1000px)
                         rotateX(${rotateX}deg)
                         rotateY(${rotateY}deg)
                         translateY(-10px)`;


                    if (logo) {

                        const moveX =
                            ((x / rect.width) - 0.5) *
                            5;


                        const moveY =
                            ((y / rect.height) - 0.5) *
                            5;


                        logo.style.transform =
                            `scale(1.08)
                             translate(${moveX}px, ${moveY}px)`;

                    }

                }
            );


            card.addEventListener(
                "mouseleave",
                () => {

                    card.style.transform =
                        "";


                    if (logo) {

                        logo.style.transform =
                            "";

                    }

                }
            );

        });

    }


    /* =====================================================
       SCROLL REVEAL
    ===================================================== */

    const revealItems =
        document.querySelectorAll(
            ".about-heading, " +
            ".person-card, " +
            ".partnership-heading, " +
            ".partner-card, " +
            ".partnership-note"
        );


    const revealObserver =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target.classList.add(
                            "show"
                        );

                        revealObserver.unobserve(
                            entry.target
                        );

                    }

                });

            },
            {
                threshold: 0.12
            }
        );


    revealItems.forEach(
        (element, index) => {

            element.style.transitionDelay =
                `${Math.min(index * 0.05, 0.3)}s`;

            revealObserver.observe(
                element
            );

        }
    );


    /* =====================================================
       SUBTLE BACKGROUND MOVEMENT
    ===================================================== */

    const peopleSection =
        document.querySelector(
            ".people-section"
        );


    const partnershipSection =
        document.querySelector(
            ".partnership-section"
        );


    if (
        window.matchMedia(
            "(pointer: fine)"
        ).matches
    ) {

        window.addEventListener(
            "mousemove",
            event => {

                const x =
                    (event.clientX /
                        window.innerWidth) -
                    0.5;


                const y =
                    (event.clientY /
                        window.innerHeight) -
                    0.5;


                if (peopleSection) {

                    const circleOne =
                        peopleSection.querySelector(
                            ".circle-one"
                        );


                    const circleTwo =
                        peopleSection.querySelector(
                            ".circle-two"
                        );


                    if (circleOne) {

                        circleOne.style.transform =
                            `translate(
                                ${x * 18}px,
                                ${y * 12}px
                            )`;

                    }


                    if (circleTwo) {

                        circleTwo.style.transform =
                            `translate(
                                ${x * -12}px,
                                ${y * -10}px
                            )`;

                    }

                }


                if (partnershipSection) {

                    const orbOne =
                        partnershipSection.querySelector(
                            ".orb-one"
                        );


                    const orbTwo =
                        partnershipSection.querySelector(
                            ".orb-two"
                        );


                    if (orbOne) {

                        orbOne.style.transform =
                            `translate(
                                ${x * 15}px,
                                ${y * 12}px
                            )`;

                    }


                    if (orbTwo) {

                        orbTwo.style.transform =
                            `translate(
                                ${x * -10}px,
                                ${y * -8}px
                            )`;

                    }

                }

            }
        );

    }

});
