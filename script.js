let allData = [];

// 1. 데이터 로드
Papa.parse("barrier_free.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    encoding: "EUC-KR", // 한글 깨짐 방지를 위해 공공데이터 표준 인코딩 설정
    complete: function(results) {
        // 데이터가 비어있는지 확인
        if (results.data.length === 0) {
            console.error("CSV 파일이 비어있거나 읽을 수 없습니다.");
            return;
        }

        // 컬럼명 공백 제거 및 데이터 정제
        allData = results.data.map(item => {
            let cleanItem = {};
            for (let key in item) {
                // 키값과 밸류값의 앞뒤 공백을 모두 제거
                const cleanKey = key.trim();
                cleanItem[cleanKey] = item[key] ? item[key].trim() : "";
            }
            return cleanItem;
        }).filter(d => d['시설명']); // 시설명이 있는 데이터만 필터링

        console.log("로드된 데이터 개수:", allData.length);
        console.log("첫 번째 데이터 확인:", allData[0]); // 브라우저 콘솔(F12)에서 확인 가능

        initFilters();
    },
    error: function(err) {
        console.error("CSV 파일을 불러오는 중 오류 발생:", err);
        document.getElementById('result-status').innerText = "데이터 파일을 불러올 수 없습니다.";
    }
});

// 시도 및 카테고리1 필터 초기화
function initFilters() {
    const sidoSelect = document.getElementById('sidoSelect');
    const cat1Select = document.getElementById('cat1Select');

    // 데이터에서 고유값 추출
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

// 시군구 업데이트
function updateGugun() {
    const sido = document.getElementById('sidoSelect').value;
    const gugunSelect = document.getElementById('gugunSelect');
    gugunSelect.innerHTML = '<option value="">시/군/구 선택</option>';
    
    if(!sido) return;

    const guguns = [...new Set(
        allData.filter(d => d['시도 명칭'] === sido)
               .map(d => d['시군구 명칭'])
    )].filter(Boolean).sort();

    guguns.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g; opt.textContent = g;
        gugunSelect.appendChild(opt);
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

    // 필터링 로직
    const filtered = allData.filter(d => {
        const matchSido = d['시도 명칭'] === sido;
        const matchGugun = !gugun || d['시군구 명칭'] === gugun;
        const matchCat = !cat1 || d['카테고리1'] === cat1;
        return matchSido && matchGugun && matchCat;
    });

    renderResults(filtered);
}

// 결과 출력
function renderResults(data) {
    const listDiv = document.getElementById('info-list');
    const statusDiv = document.getElementById('result-status');
    
    statusDiv.innerText = `총 ${data.length}곳의 장소를 찾았습니다.`;
    listDiv.innerHTML = '';

    if(data.length === 0) {
        listDiv.innerHTML = '<div class="welcome-card"><p>해당 조건에 맞는 검색 결과가 없습니다.</p></div>';
        return;
    }

    data.forEach(d => {
        const card = document.createElement('div');
        card.className = 'place-card';
        card.innerHTML = `
            <div class="place-header">
                <div class="place-title">${d['시설명']}</div>
                <div class="tag-group">
                    <span class="tag tag-cat1">${d['카테고리1'] || '미분류'}</span>
                    <span class="tag tag-cat2">${d['카테고리2'] || '기타'}</span>
                </div>
            </div>
            <div class="info-grid">
                <div class="info-item"><strong>📍 주소</strong> ${d['도로명주소'] || d['지번주소'] || '주소 정보 없음'}</div>
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
    
    // 결과 출력 후 상단으로 부드럽게 스크롤 (선택사항)
    statusDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
