let allData = [];

// 1. 데이터 로드
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
        });

        console.log("데이터 로드 완료:", allData.length, "건");
        initFilters(); // 필터 초기화 함수 호출
    }
});

// 시/도 및 카테고리1 목록 채우기
function initFilters() {
    // 시도 목록
    const sidoSet = new Set(allData.map(d => d['시도 명칭']).filter(Boolean));
    const sidoSelect = document.getElementById('sidoSelect');
    [...sidoSet].sort().forEach(sido => {
        const opt = document.createElement('option');
        opt.value = sido; opt.textContent = sido;
        sidoSelect.appendChild(opt);
    });

    // 카테고리1 목록 추가
    const cat1Set = new Set(allData.map(d => d['카테고리1']).filter(Boolean));
    const cat1Select = document.getElementById('cat1Select');
    [...cat1Set].sort().forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat; opt.textContent = cat;
        cat1Select.appendChild(opt);
    });
}

// 시군구 목록 업데이트
function updateGugun() {
    const selectedSido = document.getElementById('sidoSelect').value;
    const gugunSelect = document.getElementById('gugunSelect');
    gugunSelect.innerHTML = '<option value="">시/군/구 선택</option>';
    
    if (!selectedSido) return;

    const gugunSet = new Set(
        allData.filter(d => d['시도 명칭'] === selectedSido)
               .map(d => d['시군구 명칭']).filter(Boolean)
    );

    [...gugunSet].sort().forEach(gugun => {
        const opt = document.createElement('option');
        opt.value = gugun; opt.textContent = gugun;
        gugunSelect.appendChild(opt);
    });
}

// 조회하기 실행
function searchPlaces() {
    const sido = document.getElementById('sidoSelect').value;
    const gugun = document.getElementById('gugunSelect').value;
    const cat1 = document.getElementById('cat1Select').value; // 카테고리1 값 가져오기

    if (!sido) {
        alert("최소한 시/도는 선택해주세요!");
        return;
    }

    const filtered = allData.filter(d => 
        d['시도 명칭'] === sido && 
        (!gugun || d['시군구 명칭'] === gugun) &&
        (!cat1 || d['카테고리1'] === cat1) // 카테고리1 조건 추가
    );

    displayResults(filtered);
}

// 결과 출력 (카테고리2 포함)
function displayResults(data) {
    const listDiv = document.getElementById('info-list');
    const infoDiv = document.getElementById('result-info');
    
    infoDiv.innerText = `검색 결과: ${data.length}개`;
    listDiv.innerHTML = '';

    if (data.length === 0) {
        listDiv.innerHTML = '<div class="empty-state">조건에 맞는 검색 결과가 없습니다.</div>';
        return;
    }

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'place-card';
        card.innerHTML = `
            <div class="place-header">
                <span class="place-title">${item['시설명']}</span>
                <div>
                    <span class="category-tag">${item['카테고리1']}</span>
                    <span class="category-tag" style="background:#fff3e0; color:#e67e22; margin-left:5px;">${item['카테고리2'] || '일반'}</span>
                </div>
            </div>
            <div class="place-info">
                <div><strong>📍 주소:</strong> ${item['도로명주소'] || item['지번주소'] || '정보 없음'}</div>
                <div><strong>⏰ 운영시간:</strong> ${item['운영시간'] || '정보 없음'}</div>
                <div><strong>♿ 배리어프리 정보:</strong> 
                    ${item['장애인용 출입문'] === 'Y' ? '<span class="badge">출입문 편리</span>' : ''} 
                    ${item['장애인 화장실 유무'] === 'Y' ? '<span class="badge">장애인 화장실</span>' : ''}
                    ${item['장애인 전용 주차장 여부'] === 'Y' ? '<span class="badge">전용 주차장</span>' : ''}
                </div>
            </div>
        `;
        listDiv.appendChild(card);
    });
}
