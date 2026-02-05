document.addEventListener('DOMContentLoaded', function() {
    console.log("Projects Module Loaded...");

    // 1. Project Filtering Logic
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.classList.remove('hidden-project');
                } else {
                    card.classList.add('hidden-project');
                }
            });
        });
    });

    // 2. Project Modal Logic
    function initializeProjectModal() {
        const modal = document.getElementById('projectModal');
        if (!modal) return;

        const closeBtn = modal.querySelector('.close-modal-btn');
        const prevBtn = modal.querySelector('.prev-btn');
        const nextBtn = modal.querySelector('.next-btn');
        const modalImage = document.getElementById('modalProjectImage');
        const spinner = modal.querySelector('.loading-spinner');
        const titleEl = document.getElementById('modalProjectTitle');
        const tagsEl = document.getElementById('modalProjectTags');
        const descEl = document.getElementById('modalProjectDescription');
        const linkBtn = document.getElementById('modalProjectLink');
        const printBtn = document.getElementById('modalPrintBtn');
        const counterEl = document.getElementById('modalProjectCounter');

        let currentProjectIndex = 0;
        let visibleProjects = [];

        const openModal = (projectIndex) => {
            visibleProjects = Array.from(document.querySelectorAll('.project-card:not(.hidden-project)'));
            if (projectIndex < 0 || projectIndex >= visibleProjects.length) return;

            currentProjectIndex = projectIndex;
            const card = visibleProjects[currentProjectIndex];
            if (!card) return;

            // Populate modal data
            const title = card.querySelector('h3').textContent;
            const imageSrc = card.querySelector('.slider-wrapper img').src;
            const tagsHTML = card.querySelector('.project-tags').innerHTML;
            const description = card.querySelector('.project-description').textContent;
            const projectLink = card.querySelector('.view-btn')?.href;
            const pdfLink = card.querySelector('.download-btn')?.href;

            // Show spinner and hide image
            if(spinner) spinner.classList.add('active');
            modalImage.style.display = 'none';
            modalImage.style.opacity = '0';

            // Set content
            titleEl.textContent = title;
            tagsEl.innerHTML = tagsHTML;
            descEl.textContent = description;
            if(counterEl) counterEl.textContent = `${currentProjectIndex + 1} / ${visibleProjects.length}`;

            // Handle image loading
            modalImage.src = imageSrc;
            modalImage.onload = () => {
                if(spinner) spinner.classList.remove('active');
                modalImage.style.display = 'block';
                setTimeout(() => modalImage.style.opacity = '1', 50);
            };

            // Handle buttons
            if (projectLink && !projectLink.endsWith('#')) {
                linkBtn.href = projectLink;
                linkBtn.style.display = 'inline-flex';
            } else {
                linkBtn.style.display = 'none';
            }

            if (pdfLink && pdfLink.toLowerCase().includes('.pdf')) {
                printBtn.style.display = 'inline-flex';
                printBtn.onclick = () => printImage(imageSrc);
            } else {
                printBtn.style.display = 'none';
            }

            // Show/hide nav buttons
            prevBtn.style.display = currentProjectIndex === 0 ? 'none' : 'flex';
            nextBtn.style.display = currentProjectIndex === visibleProjects.length - 1 ? 'none' : 'flex';

            modal.classList.add('active');
            document.body.classList.add('menu-open');
        };

        const closeModal = () => {
            modal.classList.remove('active');
            document.body.classList.remove('menu-open');
        };

        function printImage(src) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html><head><title>Print Certificate</title></head>
                <body style="margin:0; text-align:center;">
                    <img src="${src}" style="max-width:100%;" onload="window.print(); window.close();">
                </body></html>
            `);
            printWindow.document.close();
        }

        // Event Listeners
        document.querySelectorAll('.projects-grid').forEach(grid => {
            grid.addEventListener('click', e => {
                const trigger = e.target.closest('.view-btn');
                if (trigger && !trigger.classList.contains('download-btn')) {
                    e.preventDefault();
                    const card = trigger.closest('.project-card');
                    const allVisibleCards = Array.from(document.querySelectorAll('.project-card:not(.hidden-project)'));
                    const projectIndex = allVisibleCards.indexOf(card);
                    if (projectIndex > -1) {
                        openModal(projectIndex);
                    }
                }
            });
        });

        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', e => {
            if (e.target === modal) closeModal();
        });

        nextBtn.addEventListener('click', () => openModal(currentProjectIndex + 1));
        prevBtn.addEventListener('click', () => openModal(currentProjectIndex - 1));

        document.addEventListener('keydown', e => {
            if (modal.classList.contains('active')) {
                if (e.key === 'ArrowRight') nextBtn.click();
                if (e.key === 'ArrowLeft') prevBtn.click();
                if (e.key === 'Escape') closeModal();
            }
        });
    }

    initializeProjectModal();

    // 3. Initialize Sliders for all Project Cards
    function initializeSlider(card) {
        const sliderWrapper = card.querySelector('.slider-wrapper');
        if (!sliderWrapper) return;

        const slides = card.querySelectorAll('.slider-wrapper img');
        const nextBtn = card.querySelector('.slider-nav.next');
        const prevBtn = card.querySelector('.slider-nav.prev');
        const dotsContainer = card.querySelector('.slider-dots');
        
        if (slides.length <= 1) {
            if(nextBtn) nextBtn.style.display = 'none';
            if(prevBtn) prevBtn.style.display = 'none';
            return;
        };

        let currentIndex = 0;
        let intervalId = null;

        // Create dots
        slides.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                showSlide(i);
            });
            dotsContainer.appendChild(dot);
        });
        const dots = dotsContainer.querySelectorAll('.dot');

        function showSlide(index) {
            if (index >= slides.length) {
                index = 0;
            } else if (index < 0) {
                index = slides.length - 1;
            }
            sliderWrapper.style.transform = `translateX(-${index * 100}%)`;
            currentIndex = index;
            updateDots();
        }

        function updateDots() {
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });
        }

        function startSlider() {
            intervalId = setInterval(() => {
                showSlide(currentIndex + 1);
            }, 3000);
        }

        function stopSlider() {
            clearInterval(intervalId);
        }

        if(nextBtn) nextBtn.addEventListener('click', () => showSlide(currentIndex + 1));
        if(prevBtn) prevBtn.addEventListener('click', () => showSlide(currentIndex - 1));

        card.addEventListener('mouseenter', stopSlider);
        card.addEventListener('mouseleave', startSlider);

        startSlider();
    }

    projectCards.forEach(card => {
        initializeSlider(card);
    });

    // 4. Read More Functionality
    const readMoreBtns = document.querySelectorAll('.read-more-btn');
    readMoreBtns.forEach(btn => {
        const desc = btn.parentElement;
        const moreText = desc.querySelector('.more-desc');
        const icon = btn.querySelector('i');

        if (moreText && moreText.textContent.trim().length > 0) {
            btn.style.display = 'inline-block'; // Show button only if there is more text
            btn.addEventListener('click', () => {
                desc.classList.toggle('expanded');
                icon.classList.toggle('fa-chevron-down');
                icon.classList.toggle('fa-chevron-up');
            });
        }
    });

    // 5. Certificate Viewer
    function initializeCertificateViewer() {
        const certNavItems = document.querySelectorAll('#certificates .nav-item');
        const certSubItems = document.querySelectorAll('#certificates .nav-sub-item');
        const welcomeView = document.getElementById('suite-welcome-cert');
        const certView = document.getElementById('active-cert-container');

        if (!certNavItems.length) return;

        // Data for certificates
        const certificateData = {
            'concrete-csi': {
                title: 'Concrete Design (CSI) Diploma',
                imgSrc: 'images/Design of concrete CSI Deploma.jpg',
                description: 'Comprehensive diploma on concrete structures design using the CSI package (ETABS, SAFE).',
                tags: ['ETABS', 'SAFE', 'CSI'],
                pdf: 'images/Design of concrete CSI Deploma.pdf'
            },
            'steel-lvl-1': {
                title: 'Steel Structure Design (Lvl 1)',
                imgSrc: 'images/Design of steel structure ( Level 1 ).jpg',
                description: 'Foundational principles of steel structure design and analysis.',
                tags: ['Steel', 'Level 1'],
                pdf: 'images/Design of steel structure ( Level 1 ).pdf'
            },
            'steel-lvl-2': {
                title: 'Steel Structure Design (Lvl 2)',
                imgSrc: 'images/Design of steel structure ( Level 2 ).jpg',
                description: 'Intermediate concepts including connection design and stability analysis.',
                tags: ['Steel', 'Level 2'],
                pdf: 'images/Design of steel structure ( Level 2 ).pdf'
            },
            'steel-lvl-3': {
                title: 'Steel Structure Design (Lvl 3)',
                imgSrc: 'images/Design of steel structure ( Level 3 ).jpg',
                description: 'Advanced topics in steel design for complex structures and systems.',
                tags: ['Steel', 'Level 3'],
                pdf: 'images/Design of steel structure ( Level 3 ).pdf'
            },
            'steel-lvl-4': {
                title: 'Steel Structure Design (Lvl 4)',
                imgSrc: 'images/Design of steel structure ( Level 4 ).jpg',
                description: 'Expert-level steel structure design, optimization, and special cases.',
                tags: ['Steel', 'Level 4'],
                pdf: 'images/Design of steel structure ( Level 4 ).pdf'
            },
            'hard-work': {
                title: 'Certificate of Appreciation',
                imgSrc: 'images/Hard Work.jpg',
                description: 'Recognition for dedication, perseverance, and hard work during the training period.',
                tags: ['Diligence'],
                pdf: 'images/Hard Work.jpg'
            },
            'damietta-practice': {
                title: 'Practical Training (Damietta)',
                imgSrc: 'images/practise in domiiat .jpg',
                description: 'Certificate for completing hands-on practical training in Damietta.',
                tags: ['Training', 'Damietta'],
                pdf: 'images/practise in domiiat .pdf'
            },
            'mys-engineering': {
                title: 'M.Y.S Engineering',
                imgSrc: 'images/M Y S .jpg',
                description: 'Certificate of participation or contribution from M.Y.S Engineering.',
                tags: ['MYS'],
                pdf: 'images/M Y S .pdf'
            }
        };

        // Handle sidebar accordion
        certNavItems.forEach(item => {
            const header = item.querySelector('.nav-header');
            header.addEventListener('click', () => {
                item.classList.toggle('active');
            });
        });

        // Handle certificate selection
        certSubItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const certId = item.getAttribute('data-cert');
                const data = certificateData[certId];

                if (data) {
                    certView.innerHTML = `
                        <div class="project-card" style="margin: 0; transform: none; box-shadow: none;">
                            <div class="project-image-slider">
                                <div class="slider-wrapper">
                                    <img src="${data.imgSrc}" alt="${data.title}" loading="lazy">
                                </div>
                                <button class="slider-nav prev"><i class="fas fa-chevron-left"></i></button>
                                <button class="slider-nav next"><i class="fas fa-chevron-right"></i></button>
                                <div class="slider-dots"></div>
                            </div>
                            <div class="project-info">
                                <h3>${data.title}</h3>
                                <p class="project-description">${data.description}</p>
                                <div class="project-tags">
                                    ${data.tags.map(tag => `<span>${tag}</span>`).join('')}
                                </div>
                                <div class="project-btns">
                                    <a href="${data.imgSrc}" class="view-btn" target="_blank">View Image <i class="fas fa-eye"></i></a>
                                    <a href="${data.pdf}" class="view-btn download-btn" download>Download PDF <i class="fas fa-file-pdf"></i></a>
                                </div>
                            </div>
                        </div>
                    `;
                    welcomeView.classList.remove('active');
                    certView.classList.add('active');

                    // Initialize slider for the newly created card
                    const newCard = certView.querySelector('.project-card');
                    if(newCard) {
                        initializeSlider(newCard);
                    }
                }
            });
        });
    }

    initializeCertificateViewer();
});