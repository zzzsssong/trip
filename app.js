/**
 * History Architecture Map Application
 */

let map = null;
let currentMarkers = [];
let currentSites = []; // Currently filtered sites

// Initialize App
window.onload = function() {
    initMap();
    initEventListeners();
    
    // Initial load
    filterAndRender();
};

// 1. Map Initialization
function initMap() {
    const container = document.getElementById('map');
    
    // Check if Kakao is loaded
    if (typeof kakao === 'undefined' || !kakao.maps) {
        document.getElementById('apikey-warning').style.display = 'block';
        return;
    }

    const options = {
        center: new kakao.maps.LatLng(35.8347, 129.2190), // Default: Gyeongju
        level: 7
    };

    map = new kakao.maps.Map(container, options);
}

// 2. Event Listeners
function initEventListeners() {
    document.getElementById('region-select').addEventListener('change', handleRegionChange);
    document.getElementById('era-slider').addEventListener('input', handleEraChange);
    document.getElementById('btn-recommend-course').addEventListener('click', generateCourses);
}

// Handle Region Change
function handleRegionChange(e) {
    const region = e.target.value;
    filterAndRender();
    
    // Move map center based on region (Simple presets)
    if (map) {
        let moveLat, moveLng, level;
        if (region === 'gyeongju') { moveLat = 35.8347; moveLng = 129.2190; level = 7; }
        else if (region === 'seoul') { moveLat = 37.5796; moveLng = 126.9770; level = 7; }
        else if (region === 'buyeo') { moveLat = 36.2817; moveLng = 126.9129; level = 7; }
        else { return; } // 'all' - don't move or move to center of KR

        const moveLatLon = new kakao.maps.LatLng(moveLat, moveLng);
        map.panTo(moveLatLon);
    }
}

// Handle Era Change
function handleEraChange(e) {
    const val = parseInt(e.target.value);
    const eraCode = ERA_MAP[val];
    const eraText = ERA_LABELS[eraCode] || "전체";
    
    document.getElementById('current-era-display').innerText = eraText;
    filterAndRender();
}

// 3. Filtering & Rendering
function filterAndRender() {
    const regionVal = document.getElementById('region-select').value;
    const sliderVal = parseInt(document.getElementById('era-slider').value);
    const eraCode = ERA_MAP[sliderVal];

    // Filter Logic
    currentSites = HERITAGE_DATA.filter(site => {
        // Region Filter
        const regionMatch = (regionVal === 'all') || (site.region === regionVal);
        
        // Era Filter (Simple: if 'all', show all. Else match exact)
        // Note: For a real histogram, we might wan cumulative, but 'period' usually means specific era.
        let eraMatch = true;
        if (eraCode !== 'all') {
            // Special handling if needed, e.g. mapping simple eras
            eraMatch = (site.era === eraCode);
            // If slider is 'Three Kingdoms' (silla), allow simple matching
            if (eraCode === 'silla' && (site.era === 'silla' || site.era === 'baekje')) eraMatch = true;
        }

        return regionMatch && eraMatch;
    });

    renderMarkers(currentSites);
}

function renderMarkers(sites) {
    if (!map) return;

    // Clear existing
    for (let i = 0; i < currentMarkers.length; i++) {
        currentMarkers[i].setMap(null);
    }
    currentMarkers = [];

    // Add new
    sites.forEach(site => {
        const markerPosition = new kakao.maps.LatLng(site.lat, site.lng);
        const marker = new kakao.maps.Marker({
            position: markerPosition,
            title: site.name
        });
        marker.setMap(map);
        
        // Add info window on click
        const iwContent = `<div style="padding:5px;"><strong>${site.name}</strong><br>${site.desc}</div>`;
        const infowindow = new kakao.maps.InfoWindow({
            content: iwContent,
            removable: true
        });

        kakao.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map, marker);
        });

        currentMarkers.push(marker);
    });
}

// 4. Course Recommendation Algorithm
function generateCourses() {
    const resultsContainer = document.getElementById('course-results');
    resultsContainer.innerHTML = ''; // Clear previous

    if (currentSites.length < 2) {
        resultsContainer.innerHTML = '<div class="placeholder-msg">코스를 만들기에 문화유산이 부족합니다.<br>검색 조건을 넓혀보세요.</div>';
        return;
    }

    // Logic: Create 3 random distinct valid paths
    // A path is: Start -> Next (within 20km) -> Next (within 20km) -> Max 3 nodes
    
    const courses = [];
    const ATTEMPTS = 20; // Try 20 times to find 3 good courses

    for (let i = 0; i < ATTEMPTS; i++) {
        if (courses.length >= 3) break;
        
        const path = buildRandomPath(currentSites);
        if (path.length >= 2) {
            // Check uniqueness (naive check)
            const pathId = path.map(p => p.id).join('-');
            const isDuplicate = courses.some(c => c.map(p => p.id).join('-') === pathId);
            
            if (!isDuplicate) {
                courses.push(path);
            }
        }
    }

    if (courses.length === 0) {
        resultsContainer.innerHTML = '<div class="placeholder-msg">조건에 맞는 코스를 찾을 수 없습니다.</div>';
    } else {
        courses.forEach((course, idx) => {
            renderCourseCard(course, idx + 1);
        });
        
        // Optional: Draw lines for the first course on map (just to show functionality)
        // drawCoursePolyline(courses[0]); 
    }
}

function buildRandomPath(sites) {
    // Clone to pick from
    let pool = [...sites];
    
    // 1. Pick Start
    const startIdx = Math.floor(Math.random() * pool.length);
    const startNode = pool[startIdx];
    pool.splice(startIdx, 1);
    
    const path = [startNode];
    
    // 2. Find Next (Nearest or Random within 20km)
    // Let's maximize connectivity: find all within 20km
    
    while (path.length < 3 && pool.length > 0) {
        const lastNode = path[path.length - 1];
        
        // Filter pool for distance < 20km
        const neighbors = pool.filter(node => getDistanceFromLatLonInKm(lastNode.lat, lastNode.lng, node.lat, node.lng) <= 20);
        
        if (neighbors.length === 0) break;
        
        // Pick random neighbor to vary the courses
        const nextIdx = Math.floor(Math.random() * neighbors.length);
        const nextNode = neighbors[nextIdx];
        
        path.push(nextNode);
        
        // Remove from pool to avoid loops/revisits in same path
        // (Usually one wouldn't visit same place twice)
        pool = pool.filter(n => n.id !== nextNode.id);
    }
    
    return path;
}

// UI: Render Course Card
function renderCourseCard(course, num) {
    const container = document.getElementById('course-results');
    
    const card = document.createElement('div');
    card.className = 'course-card';
    
    let stepsHtml = '';
    let totalDist = 0;
    
    for (let i = 0; i < course.length; i++) {
        const site = course[i];
        let distLabel = '';
        
        if (i > 0) {
            const d = getDistanceFromLatLonInKm(course[i-1].lat, course[i-1].lng, site.lat, site.lng);
            totalDist += d;
            distLabel = `<span class="dist">(${d.toFixed(1)}km 이동)</span>`;
        }
        
        stepsHtml += `
            <li class="course-step">
                <div class="step-info">
                    ${distLabel}
                    <span class="name">${site.name}</span>
                </div>
            </li>
        `;
    }
    
    card.innerHTML = `
        <div class="course-header">
            <h3>추천 코스 ${num}</h3>
            <span class="course-meta">총 ${totalDist.toFixed(1)}km</span>
        </div>
        <ul class="course-steps">
            ${stepsHtml}
        </ul>
    `;
    
    container.appendChild(card);
}

// Helper: Haversine Distance
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}
