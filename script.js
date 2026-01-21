let allData = [];

// 1. 데이터 로드
Papa.parse("barrier_free.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
        // [핵심] 컬럼명 앞뒤 공백 제거 및 한글 깨짐 방지 처리
        allData = results.data.map(item => {
            let cleanItem = {};
            for (let key in item) {
                cleanItem[key.trim()] = item[key] ? item[key].trim() : "";
            }
            return cleanItem;
        }).filter(d => d['시설명']); // 최소한 이름은 있는 데이터만 사용

        console.log("데이터 로드 완료:", allData.length, "건");
        initFilters();
    }
});

// 시도 및 카테고리1 필터 초기화
function initFilters() {
    // 시도 목록
    const sidoSet = new Set(allData.map(d => d['시도 명칭']).filter(Boolean));
    const sidoSelect = document.getElementById('sidoSelect');
    [...sidoSet].sort().forEach(s => {
        sidoSelect.innerHTML += `<option value="${s}">${s}</option>`;
    });

    // 카테고리1 목록 (장소 유형)
    const cat1Set = new Set(allData.map(d => d['카테고리1']).filter(Boolean));
    const cat1Select = document.getElementById('cat1Select');
    [...cat1Set].sort().forEach(c => {
        cat1Select.innerHTML += `<option value="${c}">${c}</option>`;
    });
}

// 시군구 업데이트
function updateGugun() {
    const sido = document.getElementById('sidoSelect').value;
    const gugunSelect = document.getElementById('gugunSelect');
    gugunSelect.innerHTML = '<option value="">시/군/구 선택</option>';
    
    if(!sido) return;

    const gugunSet = new Set(
        allData.filter(d => d['시도 명칭'] === sido).map(d => d['시군구 명칭']).filter(Boolean)
    );
    [...gugunSet].sort().forEach(g => {
        gugunSelect.innerHTML += `<option value="${g}">${g}</option>`;
    });
}

// 검색 실행
function searchPlaces() {
    const sido = document.getElementById('sidoSelect').value;
    const gugun = document.getElementById('gugunSelect').value;
    const cat1 = document.getElementById('cat1Select').value;

    if(!sido) {
        alert("지역(시/도)을 먼저 선택해주세요!");
        return;
    }

    const filtered = allData.filter(d => 
        d['시도 명칭'] === sido && 
        (!gugun || d['시군구 명칭'] === gugun) &&
        (!cat1 || d['카테고리1'] === cat1)
    );

    renderResults(filtered);
}

// 결과 출력
function renderResults(data) {
    const listDiv = document.getElementById('info-list');
    const infoDiv = document.getElementById('result-info');
    
    infoDiv.innerText = `검색 결과: ${data.length}개`;
    listDiv.innerHTML = '';

    if(data.length === 0) {
        listDiv.innerHTML = '<p class="empty-state">해당 조건에 맞는 장소가 없습니다.</p>';
        return;
    }

    data.forEach(d => {
        const card = document.createElement('div');
        card.className = 'place-card';
        card.innerHTML = `
            <div class="place-header">
                <div class="place-title">${d['시설명']}</div>
                <div class="tags">
                    <span class="tag tag-cat1">${d['카테고리1']}</span>
                    <span class="tag tag-cat2">${d['카테고리2'] || '일반'}</span>
                </div>
            </div>
            <div class="place-info">
                <div class="info-row"><strong>📍 주소:</strong> ${d['도로명주소'] || d['지번주소']}</div>
                <div class="info-row"><strong>⏰ 운영시간:</strong> ${d['운영시간'] || '정보없음'}</div>
                <div class="badge-group">
                    ${d['장애인용 출입문'] === 'Y' ? '<span class="badge">♿ 출입문 편리</span>' : ''}
                    ${d['장애인 화장실 유무'] === 'Y' ? '<span class="badge">🚻 장애인 화장실</span>' : ''}
                    ${d['장애인 전용 주차장 여부'] === 'Y' ? '<span class="badge">🅿️ 전용 주차장</span>' : ''}
                </div>
            </div>
        `;
        listDiv.appendChild(card);
    });
}
