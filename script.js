let allData = [];

Papa.parse("barrier_free.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
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
    const sidoSet = new Set(allData.map(d => d['시도 명칭']).filter(Boolean));
    const cat1Set = new Set(allData.map(d => d['카테고리1']).filter(Boolean));
    
    const sidoSelect = document.getElementById('sidoSelect');
    [...sidoSet].sort().forEach(s => { sidoSelect.innerHTML += `<option value="${s}">${s}</option>`; });

    const cat1Select = document.getElementById('cat1Select');
    [...cat1Set].sort().forEach(c => { cat1Select.innerHTML += `<option value="${c}">${c}</option>`; });
}

function updateGugun() {
    const sido = document.getElementById('sidoSelect').value;
    const gugunSelect = document.getElementById('gugunSelect');
    gugunSelect.innerHTML = '<option value="">시/군/구 선택</option>';
    if(!sido) return;
    const gugunSet = new Set(allData.filter(d => d['시도 명칭'] === sido).map(d => d['시군구 명칭']).filter(Boolean));
    [...gugunSet].sort().forEach(g => { gugunSelect.innerHTML += `<option value="${g}">${g}</option>`; });
}

function searchPlaces() {
    const sido = document.getElementById('sidoSelect').value;
    const gugun = document.getElementById('gugunSelect').value;
    const cat1 = document.getElementById('cat1Select').value;

    if(!sido) { alert("지역을 선택해주세요!"); return; }

    const filtered = allData.filter(d => 
        d['시도 명칭'] === sido && 
        (!gugun || d['시군구 명칭'] === gugun) &&
        (!cat1 || d['카테고리1'] === cat1)
    );

    renderResults(filtered);
}

function renderResults(data) {
    const listDiv = document.getElementById('info-list');
    document.getElementById('result-status').innerText = `총 ${data.length}곳의 장소를 찾았습니다.`;
    listDiv.innerHTML = '';

    if(data.length === 0) {
        listDiv.innerHTML = '<div class="welcome-card"><p>검색 결과가 없습니다.</p></div>';
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
                    <span class="tag tag-cat2">${d['카테고리2'] || '기타'}</span>
                </div>
            </div>
            <div class="info-grid">
                <div class="info-item"><strong>📍 주소</strong> ${d['도로명주소'] || d['지번주소']}</div>
                <div class="info-item"><strong>⏰ 시간</strong> ${d['운영시간'] || '정보없음'}</div>
            </div>
            <div class="barrier-box">
                ${d['장애인용 출입문'] === 'Y' ? '<span class="badge">♿ 출입문 편리</span>' : ''}
                ${d['장애인 화장실 유무'] === 'Y' ? '<span class="badge">🚻 장애인 화장실</span>' : ''}
                ${d['장애인 전용 주차장 여부'] === 'Y' ? '<span class="badge">🅿️ 전용 주차장</span>' : ''}
            </div>
        `;
        listDiv.appendChild(card);
    });
}
