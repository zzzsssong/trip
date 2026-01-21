let allData = [];

Papa.parse("barrier_free.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    encoding: "EUC-KR",
    complete: function(results) {
        allData = results.data.map(item => {
            let cleanItem = {};
            for (let key in item) {
                cleanItem[key.trim()] = item[key] ? item[key].trim() : "";
            }
            return cleanItem;
        }).filter(d => d['시설명']);
        initFilters();
    }
});

function initFilters() {
    const sidos = [...new Set(allData.map(d => d['시도 명칭']))].filter(Boolean).sort();
    const cats = [...new Set(allData.map(d => d['카테고리1']))].filter(Boolean).sort();
    const sidoSelect = document.getElementById('sidoSelect');
    const cat1Select = document.getElementById('cat1Select');
    sidos.forEach(s => { sidoSelect.innerHTML += `<option value="${s}">${s}</option>`; });
    cats.forEach(c => { cat1Select.innerHTML += `<option value="${c}">${c}</option>`; });
}

function updateGugun() {
    const sido = document.getElementById('sidoSelect').value;
    const gugunSelect = document.getElementById('gugunSelect');
    gugunSelect.innerHTML = '<option value="">시/군/구 선택</option>';
    if(!sido) return;
    const guguns = [...new Set(allData.filter(d => d['시도 명칭'] === sido).map(d => d['시군구 명칭']))].filter(Boolean).sort();
    guguns.forEach(g => { gugunSelect.innerHTML += `<option value="${g}">${g}</option>`; });
}

function searchPlaces() {
    const sido = document.getElementById('sidoSelect').value;
    const gugun = document.getElementById('gugunSelect').value;
    const cat1 = document.getElementById('cat1Select').value;
    if(!sido) { alert("지역을 먼저 선택해주세요!"); return; }
    const filtered = allData.filter(d => d['시도 명칭'] === sido && (!gugun || d['시군구 명칭'] === gugun) && (!cat1 || d['카테고리1'] === cat1));
    renderResults(filtered);
}

function renderResults(data) {
    const listDiv = document.getElementById('info-list');
    const statusDiv = document.getElementById('result-status');
    statusDiv.innerHTML = `<h3>총 ${data.length}곳의 장소를 찾았습니다.</h3>`;
    listDiv.innerHTML = '';
    if(data.length === 0) {
        listDiv.innerHTML = '<p style="text-align:center; padding:50px; color:#999;">해당 조건에 맞는 검색 결과가 없습니다.</p>';
        return;
    }
    data.forEach(d => {
        const card = document.createElement('div');
        card.className = 'place-card';
        card.innerHTML = `
            <div class="place-header">
                <div class="place-title">${d['시설명']}</div>
                <div class="tag-group">
                    <span class="tag tag-cat1">${d['카테고리1']}</span>
                    <span class="tag tag-cat2">${d['카테고리2'] || '일반'}</span>
                </div>
            </div>
            <div class="info-grid">
                <div><strong>📍 주소:</strong> ${d['도로명주소'] || d['지번주소']}</div>
                <div><strong>⏰ 시간:</strong> ${d['운영시간'] || '정보없음'}</div>
            </div>
            <div class="barrier-box">
                ${d['장애인용 출입문'] === 'Y' ? '<span class="badge">♿ 출입문 편리</span>' : ''}
                ${d['장애인 화장실 유무'] === 'Y' ? '<span class="badge">🚻 장애인 화장실</span>' : ''}
                ${d['장애인 전용 주차장 여부'] === 'Y' ? '<span class="badge">🅿️ 전용 주차장</span>' : ''}
            </div>
        `;
        listDiv.appendChild(card);
    });
    statusDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
