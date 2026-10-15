/* =========================================================
   MYGEOVISION
   PROJECTS PAGE JAVASCRIPT
========================================================= */


/* =========================================================
   FILE PATHS
=========================================================

   IMPORTANT:

   These paths assume your website folder is:

   D:\MyGeovision\

   and the data folder is:

   D:\MyGeovision\Data\

   Therefore the browser can access them as:

   Data/KenyaCounties.geojson
   Data/MYGeovision_Projects_Geocoded.geojson

========================================================= */

const PROJECTS_GEOJSON =
    "Data/MYGeovision_Projects_Geocoded.geojson";

const COUNTIES_GEOJSON =
    "Data/KenyaCounties.geojson";


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let projectsMap;

let projectsLayer;

let countiesLayer;

let projectFeatures = [];

let countyFeatures = [];


/* =========================================================
   DOM ELEMENTS
========================================================= */

const totalProjectsElement =
    document.getElementById("totalProjects");

const mappedLocationsElement =
    document.getElementById("mappedLocations");

const mappedCountiesElement =
    document.getElementById("mappedCounties");

const mapProjectCountElement =
    document.getElementById("mapProjectCount");

const mapLoadingElement =
    document.getElementById("mapLoading");

const mobileMenuButton =
    document.getElementById("projectsMenuButton");

const mobileMenu =
    document.getElementById("projectsMobileMenu");


/* =========================================================
   INITIALIZE PAGE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeMobileMenu();

        initializeMap();

    }
);


/* =========================================================
   MOBILE MENU
========================================================= */

function initializeMobileMenu() {

    if (
        !mobileMenuButton ||
        !mobileMenu
    ) {

        return;

    }


    mobileMenuButton.addEventListener(
        "click",
        function () {

            const isOpen =
                mobileMenu.classList.toggle("open");

            mobileMenuButton.setAttribute(
                "aria-expanded",
                isOpen
            );

        }
    );


    /*
       Close menu when a navigation
       link is selected.
    */

    const menuLinks =
        mobileMenu.querySelectorAll("a");


    menuLinks.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function () {

                    mobileMenu.classList.remove(
                        "open"
                    );

                    mobileMenuButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }
            );

        }
    );

}


/* =========================================================
   INITIALIZE LEAFLET MAP
========================================================= */

function initializeMap() {

    projectsMap =
        L.map(
            "projectsMap",
            {

                zoomControl:
                    true,

                minZoom:
                    5,

                maxZoom:
                    18

            }
        );


    /*
       Carto Voyager provides a clean
       modern basemap while keeping
       the GIS overlays visible.
    */

    L.tileLayer(
         "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
        {

            attribution:
                "Tiles &copy; Esri",

            subdomains:
                "abcd",

            maxZoom:
                24

        }
    ).addTo(
        projectsMap
    );


    /*
       Temporary Kenya view.
       It will automatically be replaced
       by the GeoJSON bounds after loading.
    */

    projectsMap.setView(
        [-0.0236, 37.9062],
        10
    );


    loadGeospatialData();

}


/* =========================================================
   LOAD BOTH GEOJSON FILES
========================================================= */

async function loadGeospatialData() {

    try {

        /*
           Load both files simultaneously.
        */

        const [
            countiesResponse,
            projectsResponse
        ] = await Promise.all(
            [

                fetch(
                    COUNTIES_GEOJSON
                ),

                fetch(
                    PROJECTS_GEOJSON
                )

            ]
        );


        /*
           Check whether files were found.
        */

        if (
            !countiesResponse.ok
        ) {

            throw new Error(
                "KenyaCounties.geojson could not be loaded."
            );

        }


        if (
            !projectsResponse.ok
        ) {

            throw new Error(
                "MYGeovision_Projects_Geocoded.geojson could not be loaded."
            );

        }


        /*
           Convert responses to JSON.
        */

        const countiesData =
            await countiesResponse.json();

        const projectsData =
            await projectsResponse.json();


        /*
           Store features globally.
        */

        countyFeatures =
            countiesData.features || [];

        projectFeatures =
            projectsData.features || [];


        /*
           Draw counties.
        */

        drawCounties(
            countiesData
        );


        /*
           Draw projects.
        */

        drawProjects(
            projectsData
        );


        /*
           Calculate statistics.
        */

        calculateStatistics(
            projectsData,
            countiesData
        );


        /*
           Hide loading overlay.
        */

        hideMapLoading();


    }

    catch (error) {

        console.error(
            "GeoJSON loading error:",
            error
        );


        showMapError(
            error.message
        );

    }

}


/* =========================================================
   DRAW KENYA COUNTIES
========================================================= */

function drawCounties(
    countiesData
) {

    countiesLayer =
        L.geoJSON(
            countiesData,
            {

                style:
                    function () {

                        return {

                            color:
                                "#111111",

                            weight:
                                1.4,

                            opacity:
                                0.85,

                            fill:
                                false,

                            fillOpacity:
                                0

                        };

                    },


                /*
                   County hover effect.
                */

                onEachFeature:
                    function (
                        feature,
                        layer
                    ) {

                        layer.on({

                            mouseover:
                                function (event) {

                                    event.target.setStyle({

                                        weight:
                                            2.2,

                                        color:
                                            "#000000"

                                    });

                                },

                            mouseout:
                                function (event) {

                                    countiesLayer.resetStyle(
                                        event.target
                                    );

                                }

                        });

                    }

            }
        ).addTo(
            projectsMap
        );


}


/* =========================================================
   DRAW PROJECT POINTS
========================================================= */

function drawProjects(
    projectsData
) {

    projectsLayer =
        L.geoJSON(
            projectsData,
            {

                pointToLayer:
                    function (
                        feature,
                        latlng
                    ) {

                        return L.marker(
                            latlng,
                            {

                                icon:
                                    createProjectIcon()

                            }
                        );

                    },


                onEachFeature:
                    function (
                        feature,
                        layer
                    ) {

                        const properties =
                            feature.properties || {};


                        /*
                           Detect the project title
                           regardless of small differences
                           in field naming.
                        */

                        const projectTitle =
                            getProperty(
                                properties,
                                [

                                    "Project_Title",
                                    "Project Title",
                                    "project_title",
                                    "ProjectName",
                                    "Project_Name",
                                    "project",
                                    "title",
                                    "Title",
                                    "PROJECT"

                                ]
                            ) || "MyGeovision Project";


                        /*
                           Detect location.
                        */

                        const location =
                            getProperty(
                                properties,
                                [

                                    "Location",
                                    "location",
                                    "LOCATION",
                                    "Site",
                                    "site",
                                    "County",
                                    "county",
                                    "Place",
                                    "place"

                                ]
                            ) || "Kenya";


                        /*
                           Popup contains ONLY:

                           Project title
                           Location

                           as requested.
                        */

                        const popupHTML = `

                            <div class="project-popup">

                                <div class="project-popup-label">
                                    MYGEOVISION PROJECT
                                </div>

                                <h3>
                                    ${escapeHTML(projectTitle)}
                                </h3>

                                <div class="project-popup-location">

                                    <i class="fa-solid fa-location-dot"></i>

                                    <span>
                                        ${escapeHTML(location)}
                                    </span>

                                </div>

                            </div>

                        `;


                        layer.bindPopup(
                            popupHTML,
                            {

                                maxWidth:
                                    320,

                                closeButton:
                                    true

                            }
                        );


                        /*
                           Hover effect.
                        */

                        layer.on({

                            mouseover:
                                function () {

                                    layer.setZIndexOffset(
                                        1000
                                    );

                                },

                            mouseout:
                                function () {

                                    layer.setZIndexOffset(
                                        0
                                    );

                                }

                        });

                    }

            }
        ).addTo(
            projectsMap
        );


    /*
       Fit map to ALL project points
       when possible.
    */

    fitMapToData();

}


/* =========================================================
   CREATE PROJECT MARKER
========================================================= */

function createProjectIcon() {

    return L.divIcon({

        className:
            "custom-project-marker",

        html:
            '<div class="project-marker"></div>',

        iconSize:
            [17, 17],

        iconAnchor:
            [8.5, 8.5],

        popupAnchor:
            [0, -10]

    });

}


/* =========================================================
   FIT MAP TO PROJECT DATA
========================================================= */

function fitMapToData() {

    if (
        projectsLayer &&
        projectsLayer.getBounds().isValid()
    ) {

        const bounds =
            projectsLayer.getBounds();


        projectsMap.fitBounds(
            bounds,
            {

                padding:
                    [60, 60],

                maxZoom:
                    12

            }
        );

    }

}


/* =========================================================
   CALCULATE STATISTICS
========================================================= */

function calculateStatistics(
    projectsData,
    countiesData
) {

    const projects =
        projectsData.features || [];

    const counties =
        countiesData.features || [];


    /*
       TOTAL PROJECTS

       This comes directly from the
       number of GeoJSON features.
    */

    const totalProjects =
        projects.length;


    /*
       UNIQUE LOCATIONS

       Extract location attributes and
       count unique values.
    */

    const locations =
        projects
            .map(
                function (feature) {

                    return getProperty(
                        feature.properties || {},
                        [

                            "Location",
                            "location",
                            "LOCATION",
                            "Site",
                            "site",
                            "County",
                            "county",
                            "Place",
                            "place"

                        ]
                    );

                }
            )
            .filter(
                function (value) {

                    return (
                        value !== null &&
                        value !== undefined &&
                        String(value).trim() !== ""
                    );

                }
            )
            .map(
                function (value) {

                    return String(value)
                        .trim()
                        .toLowerCase();

                }
            );


    const uniqueLocations =
        new Set(
            locations
        );


    /*
       Update page statistics.
    */

    animateNumber(
        totalProjectsElement,
        totalProjects
    );


    animateNumber(
        mappedLocationsElement,
        uniqueLocations.size
    );


    animateNumber(
        mappedCountiesElement,
        counties.length
    );


    /*
       Update map counter.
    */

    animateNumber(
        mapProjectCountElement,
        totalProjects
    );

}


/* =========================================================
   ANIMATED NUMBER
========================================================= */

function animateNumber(
    element,
    target
) {

    if (!element) {

        return;

    }


    const duration =
        900;

    const start =
        performance.now();


    function update(
        currentTime
    ) {

        const elapsed =
            currentTime - start;


        const progress =
            Math.min(
                elapsed / duration,
                1
            );


        const eased =
            1 - Math.pow(
                1 - progress,
                3
            );


        const value =
            Math.floor(
                eased * target
            );


        element.textContent =
            value.toLocaleString();


        if (
            progress < 1
        ) {

            requestAnimationFrame(
                update
            );

        }

    }


    requestAnimationFrame(
        update
    );

}


/* =========================================================
   GET PROPERTY
=========================================================

   Handles different possible field names
   in the GeoJSON.

========================================================= */

function getProperty(
    properties,
    possibleNames
) {

    if (
        !properties
    ) {

        return null;

    }


    for (
        const name of possibleNames
    ) {

        if (
            Object.prototype.hasOwnProperty.call(
                properties,
                name
            )
        ) {

            const value =
                properties[name];


            if (
                value !== null &&
                value !== undefined &&
                String(value).trim() !== ""
            ) {

                return value;

            }

        }

    }


    /*
       Fallback:
       try case-insensitive matching.
    */

    const keys =
        Object.keys(
            properties
        );


    for (
        const possibleName of possibleNames
    ) {

        const matchingKey =
            keys.find(
                function (key) {

                    return (
                        key.toLowerCase() ===
                        possibleName.toLowerCase()
                    );

                }
            );


        if (
            matchingKey
        ) {

            const value =
                properties[
                    matchingKey
                ];


            if (
                value !== null &&
                value !== undefined &&
                String(value).trim() !== ""
            ) {

                return value;

            }

        }

    }


    return null;

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   HIDE MAP LOADING
========================================================= */

function hideMapLoading() {

    if (
        !mapLoadingElement
    ) {

        return;

    }


    mapLoadingElement.classList.add(
        "hidden"
    );


    setTimeout(
        function () {

            mapLoadingElement.style.display =
                "none";

        },
        500
    );

}


/* =========================================================
   SHOW MAP ERROR
========================================================= */

function showMapError(
    message
) {

    if (
        !mapLoadingElement
    ) {

        return;

    }


    mapLoadingElement.innerHTML = `

        <i
            class="fa-solid fa-triangle-exclamation"
            style="
                font-size:28px;
                color:#006e5c;
            "
        ></i>

        <span>
            Unable to load project data.
        </span>

        <small
            style="
                max-width:400px;
                text-align:center;
                line-height:1.6;
                color:#7a847e;
            "
        >
            ${escapeHTML(message)}
        </small>

    `;

}