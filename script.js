let allData = [];

// 1. 데이터 로드
Papa.parse("barrier_free.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    encoding: "EUC-KR", // 한글 깨짐 방지
    complete: function(results) {
        // 데이터 정제 및 공백 제거
        allData = results.data.map(item => {
            let cleanItem = {};
            for (let key in item) {
                cleanItem[key.trim()] = item[key] ? item[key].trim() : "";
            }
            return cleanItem;
        }).filter(d => d['시설명']);

        console.log("데이터 로드 완료:", allData.length);
        initFilters();
    }
});

// 2. 필터 초기화
function initFilters() {
    const sidoSelect = document.getElementById('sidoSelect');
    const cat1Select = document.getElementById('cat1Select');

    const sidos = [...new Set(allData.map(d => d['시도 명칭']))].filter(Boolean).sort();
    const cats = [...new Set(allData.map(d => d['카테고리1']))].filter(Boolean).sort();

    sidos.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s; opt.textContent = s;
        sidoSelect.appendChild(opt);
    });

    cats.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c; opt.textContent = c;
        cat1Select.appendChild(opt);
    });
}

// 3. 시군구 업데이트
function updateGugun() {
    const sido = document.getElementById('sidoSelect').value;
    const gugunSelect = document.getElementById('gugunSelect');
    gugunSelect.innerHTML = '<option value="">시/군/구 선택</option>';
    
    if(!sido) return;

    const guguns = [...new Set(
        allData.filter(d => d['시도 명칭'] === sido).map(d => d['시군구 명칭'])
    )].filter(Boolean).sort();

    guguns.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g; opt.textContent = g;
        gugunSelect.appendChild(opt);
    });
}

// 4. 검색 실행
function searchPlaces() {
    const sido = document.getElementById('sidoSelect').value;
    const gugun = document.getElementById('gugunSelect').value;
    const cat1 = document.getElementById('cat1Select').value;

    if(!sido) {
        alert("지역을 먼저 선택해주세요!");
        return;
    }

    const filtered = allData.filter(d => 
        d['시도 명칭'] === sido && 
        (!gugun || d['시군구 명칭'] === gugun) &&
        (!cat1 || d['카테고리1'] === cat1)
    );

    renderResults(filtered);
}

// 5. 결과 출력 (우리가 만든 예쁜 카드 스타일)
function renderResults(data) {
    const listDiv = document.getElementById('info-list');
    const statusDiv = document.getElementById('result-status');
    
    statusDiv.innerHTML = `<p style="font-weight:bold; color:#4A90E2; margin-bottom:15px;">총 ${data.length}곳의 장소를 찾았습니다.</p>`;
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
                    <span class="tag tag-cat2">${d['카테고리2'] || '일반'}</span>
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
    
    // 결과창으로 자동 스크롤
    statusDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
