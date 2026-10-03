document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // API CONFIGURATION
    // =====================================================

  const API_URL = "https://nurseryiq-apii.onrender.com/api";


    // =====================================================
    // ELEMENTS
    // =====================================================

    const menuBtn =
        document.getElementById("menuBtn");

    const mainNav =
        document.getElementById("mainNav");

    const cursor =
        document.querySelector(".cursor");

    const ring =
        document.querySelector(".cursor-ring");

    const plantGrid =
        document.getElementById("plantGrid");

    const plantSearch =
        document.getElementById("plantSearch");

    const categoryFilter =
        document.getElementById("categoryFilter");

    const sunFilter =
        document.getElementById("sunFilter");

    const waterFilter =
        document.getElementById("waterFilter");

    const recommendBtn =
        document.getElementById("recommendBtn");

    const recommendationResult =
        document.getElementById("recommendationResult");

    const diagnosisButton =
        document.getElementById("diagnoseBtn");

    const diagnosisResult =
        document.getElementById("diagnosisResult");


    // =====================================================
    // MOBILE MENU
    // =====================================================

    if (menuBtn && mainNav) {

        menuBtn.addEventListener("click", () => {

            mainNav.classList.toggle("open");

        });

    }


    // =====================================================
    // CUSTOM CURSOR
    // =====================================================

    if (
        window.innerWidth > 700 &&
        cursor &&
        ring
    ) {

        let mouseX = 0;
        let mouseY = 0;

        let ringX = 0;
        let ringY = 0;

        document.addEventListener("mousemove", (event) => {

            mouseX = event.clientX;
            mouseY = event.clientY;

            cursor.style.left = mouseX + "px";
            cursor.style.top = mouseY + "px";

        });

        function moveRing() {

            ringX += (mouseX - ringX) * 0.12;
            ringY += (mouseY - ringY) * 0.12;

            ring.style.left = ringX + "px";
            ring.style.top = ringY + "px";

            requestAnimationFrame(moveRing);
        }

        moveRing();

    }


    // =====================================================
    // HELPER FUNCTIONS
    // =====================================================

    function sunlightText(value) {

        const data = {
            low: "Low light",
            medium: "Partial",
            high: "Bright"
        };

        return data[value] || value || "Unknown";
    }


    function waterText(value) {

        const data = {
            low: "Low water",
            medium: "Moderate",
            high: "High water"
        };

        return data[value] || value || "Unknown";
    }


    // =====================================================
    // CREATE PLANT CARD
    // =====================================================

    function createPlantCard(plant) {

        const tags =
            Array.isArray(plant.tags)
                ? plant.tags
                : [];

        const sunlight =
            plant.sunlight ||
            plant.sun ||
            "medium";

        const water =
            plant.water ||
            "medium";

        const scientific =
            plant.scientificName ||
            plant.scientific ||
            "";

        const emoji =
            plant.emoji ||
            "🌱";


        return `

            <article class="plant-card">

                <div class="plant-image">
                    ${emoji}
                </div>

                <h3>
                    ${plant.name || "Unknown Plant"}
                </h3>

                <div class="scientific">
                    ${scientific}
                </div>

                <div class="plant-info">

                    <div class="info-pill">
                        ☀️ ${sunlightText(sunlight)}
                    </div>

                    <div class="info-pill">
                        💧 ${waterText(water)}
                    </div>

                </div>

                <div class="tags">

                    ${tags.map(tag => `
                        <span class="tag">
                            ${tag}
                        </span>
                    `).join("")}

                </div>

            </article>

        `;
    }


    // =====================================================
    // LOAD ALL PLANTS
    // =====================================================

    async function displayPlants() {

        if (!plantGrid) {
            return;
        }

        try {

            const response =
                await fetch(`${API_URL}/plants`);

            if (!response.ok) {

                throw new Error(
                    `Server error: ${response.status}`
                );

            }

            const data =
                await response.json();

            if (!data.success) {

                throw new Error(
                    data.message ||
                    "Failed to load plants"
                );

            }

            let filtered =
                data.plants || [];


            // Search
            const search =
                plantSearch
                    ? plantSearch.value.toLowerCase().trim()
                    : "";


            // Category
            const category =
                categoryFilter
                    ? categoryFilter.value
                    : "";


            // Sunlight
            const sun =
                sunFilter
                    ? sunFilter.value
                    : "";


            // Water
            const water =
                waterFilter
                    ? waterFilter.value
                    : "";


            filtered = filtered.filter((plant) => {

                const searchMatch =
                    !search ||
                    plant.name
                        .toLowerCase()
                        .includes(search) ||
                    plant.scientificName
                        .toLowerCase()
                        .includes(search);


                const categoryMatch =
                    !category ||
                    (
                        plant.tags &&
                        plant.tags.some(
                            tag =>
                                tag.toLowerCase() ===
                                category.toLowerCase()
                        )
                    );


                const sunMatch =
                    !sun ||
                    plant.sun === sun;


                const waterMatch =
                    !water ||
                    plant.water === water;


                return (
                    searchMatch &&
                    categoryMatch &&
                    sunMatch &&
                    waterMatch
                );

            });


            if (filtered.length === 0) {

                plantGrid.innerHTML = `

                    <div style="
                        grid-column:1/-1;
                        background:white;
                        padding:50px;
                        border-radius:25px;
                        text-align:center;
                    ">

                        <div style="font-size:55px;">
                            🌱
                        </div>

                        <h3>
                            No plants found
                        </h3>

                        <p>
                            Try different filters.
                        </p>

                    </div>

                `;

                return;
            }


            plantGrid.innerHTML =
                filtered
                    .map(createPlantCard)
                    .join("");

        } catch (error) {

            console.error(
                "Plant loading error:",
                error
            );

            plantGrid.innerHTML = `

                <div style="
                    grid-column:1/-1;
                    padding:40px;
                    text-align:center;
                ">

                    <h3>
                        ⚠️ Backend connection failed
                    </h3>

                    <p>
                        ${error.message}
                    </p>

                    <button id="retryPlants">
                        Try Again
                    </button>

                </div>

            `;


            const retry =
                document.getElementById("retryPlants");

            if (retry) {

                retry.addEventListener(
                    "click",
                    displayPlants
                );

            }

        }

    }


    // =====================================================
    // FILTER EVENTS
    // =====================================================

    if (plantSearch) {

        plantSearch.addEventListener(
            "input",
            displayPlants
        );

    }


    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            displayPlants
        );

    }


    if (sunFilter) {

        sunFilter.addEventListener(
            "change",
            displayPlants
        );

    }


    if (waterFilter) {

        waterFilter.addEventListener(
            "change",
            displayPlants
        );

    }


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    displayPlants();


    // =====================================================
    // SMART RECOMMENDATION
    // =====================================================

    if (
        recommendBtn &&
        recommendationResult
    ) {

        recommendBtn.addEventListener(
            "click",
            async () => {

                const environment =
                    document.getElementById(
                        "environment"
                    )?.value || "";


                const sunlight =
                    document.getElementById(
                        "finderSun"
                    )?.value || "";


                const water =
                    document.getElementById(
                        "finderWater"
                    )?.value || "";


                const experience =
                    document.getElementById(
                        "experience"
                    )?.value || "";


                recommendationResult.innerHTML = `

                    <p>
                        🌱 Finding suitable plants...
                    </p>

                `;


                try {

                    const response =
                        await fetch(
                            `${API_URL}/recommend`,
                            {

                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({

                                    environment:
                                        environment,

                                    sunlight:
                                        sunlight,

                                    water:
                                        water,

                                    experience:
                                        experience

                                })

                            }
                        );


                    if (!response.ok) {

                        throw new Error(
                            `Server error: ${response.status}`
                        );

                    }


                    const data =
                        await response.json();


                    if (!data.success) {

                        throw new Error(
                            data.message ||
                            "Recommendation failed"
                        );

                    }


                    const matches =
                        data.plants || [];


                    if (matches.length === 0) {

                        recommendationResult.innerHTML = `

                            <div class="plant-card">

                                <div class="plant-image">
                                    🌱
                                </div>

                                <h3>
                                    No exact match
                                </h3>

                                <p>
                                    Try selecting fewer conditions.
                                </p>

                            </div>

                        `;

                        return;
                    }


                    recommendationResult.innerHTML =
                        matches
                            .map(createPlantCard)
                            .join("");


                } catch (error) {

                    console.error(
                        "Recommendation error:",
                        error
                    );


                    recommendationResult.innerHTML = `

                        <div class="plant-card">

                            <h3>
                                ⚠️ Recommendation Error
                            </h3>

                            <p>
                                ${error.message}
                            </p>

                        </div>

                    `;

                }

            }
        );

    }


    // =====================================================
    // CATEGORY BUTTONS
    // =====================================================

    document
        .querySelectorAll(".category-grid button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const category =
                        button.dataset.category;


                    if (categoryFilter) {

                        categoryFilter.value =
                            category;

                    }


                    displayPlants();


                    const plantsSection =
                        document.getElementById(
                            "plants"
                        );


                    if (plantsSection) {

                        plantsSection.scrollIntoView({
                            behavior: "smooth"
                        });

                    }

                }
            );

        });


    // =====================================================
    // PLANT DIAGNOSIS
    // =====================================================

    if (
        diagnosisButton &&
        diagnosisResult
    ) {

        diagnosisButton.addEventListener(
            "click",
            async () => {

                const selected = [
                    ...document.querySelectorAll(
                        ".symptom-box input:checked"
                    )
                ].map(
                    input => input.value
                );


                if (selected.length === 0) {

                    diagnosisResult.innerHTML = `

                        <div class="empty-result">

                            <span>⚠️</span>

                            <h3>
                                Select at least one symptom
                            </h3>

                            <p>
                                Choose symptoms to generate a basic report.
                            </p>

                        </div>

                    `;

                    return;
                }


                diagnosisButton.disabled = true;


                diagnosisResult.innerHTML = `

                    <p>
                        🔍 Analyzing symptoms...
                    </p>

                `;


                try {

                    const response =
                        await fetch(
                            `${API_URL}/diagnose`,
                            {

                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({

                                    symptoms:
                                        selected

                                })

                            }
                        );


                    if (!response.ok) {

                        throw new Error(
                            `Server error: ${response.status}`
                        );

                    }


                    const data =
                        await response.json();


                    if (!data.success) {

                        throw new Error(
                            data.message ||
                            "Diagnosis failed"
                        );

                    }


                    const results =
                        data.plants || [];


                    if (results.length === 0) {

                        diagnosisResult.innerHTML = `

                            <div class="plant-card">

                                <div class="plant-image">
                                    🌱
                                </div>

                                <h3>
                                    No matching problem found
                                </h3>

                                <p>
                                    Try selecting another symptom.
                                </p>

                            </div>

                        `;

                        return;
                    }


                    diagnosisResult.innerHTML =
                        results
                            .map(plant => `

                                <div class="plant-card">

                                    <div class="plant-image">
                                        ${plant.emoji || "🌱"}
                                    </div>

                                    <h3>
                                        ${plant.name}
                                    </h3>

                                    <p>
                                        <strong>
                                            Possible symptoms:
                                        </strong>
                                        ${plant.matchedSymptoms.join(", ")}
                                    </p>

                                    <p>
                                        <strong>
                                            Suggested solution:
                                        </strong>
                                        ${plant.solution}
                                    </p>

                                </div>

                            `)
                            .join("");


                } catch (error) {

                    console.error(
                        "Diagnosis error:",
                        error
                    );


                    diagnosisResult.innerHTML = `

                        <div class="plant-card">

                            <h3>
                                ⚠️ Diagnosis Error
                            </h3>

                            <p>
                        
                                ${error.message}
                            </p>

                        </div>

                    `;

                } finally {

                    diagnosisButton.disabled = false;

                }

            }
        );

    }

});
