let allData = [];

// 1. 데이터 로드 (인코딩 자동 감지 시도)
Papa.parse("barrier_free.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
        // 컬럼명 공백 제거 및 데이터 저장
        allData = results.data.map(item => {
            let cleanItem = {};
            for (let key in item) {
                cleanItem[key.trim()] = item[key] ? item[key].trim() : "";
            }
            return cleanItem;
        });

        console.log("데이터 로드 완료:", allData.length, "건");
        initSidoFilter();
    },
    error: function(err) {
        console.error("파일을 불러올 수 없습니다:", err);
    }
});

// 시/도 목록 채우기
function initSidoFilter() {
    const sidoSet = new Set(allData.map(d => d['시도 명칭']).filter(Boolean));
    const sidoSelect = document.getElementById('sidoSelect');
    
    [...sidoSet].sort().forEach(sido => {
        const opt = document.createElement('option');
        opt.value = sido;
        opt.textContent = sido;
        sidoSelect.appendChild(opt);
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
        opt.value = gugun;
        opt.textContent = gugun;
        gugunSelect.appendChild(opt);
    });
}

// 조회하기 버튼 클릭
function searchPlaces() {
    const sido = document.getElementById('sidoSelect').value;
    const gugun = document.getElementById('gugunSelect').value;

    if (!sido) {
        alert("지역을 선택해주세요!");
        return;
    }

    const filtered = allData.filter(d => 
        d['시도 명칭'] === sido && (!gugun || d['시군구 명칭'] === gugun)
    );

    displayResults(filtered);
}

// 결과 화면 출력
function displayResults(data) {
    const listDiv = document.getElementById('info-list');
    const infoDiv = document.getElementById('result-info');
    
    infoDiv.innerText = `검색 결과: ${data.length}개`;
    listDiv.innerHTML = '';

    if (data.length === 0) {
        listDiv.innerHTML = '<div class="empty-state">검색 결과가 없습니다.</div>';
        return;
    }

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'place-card';
        card.innerHTML = `
            <div class="place-header">
                <span class="place-title">${item['시설명']}</span>
                <span class="category-tag">${item['카테고리1'] || '일반'}</span>
            </div>
            <div class="place-info">
                <div><strong>📍 주소:</strong> ${item['도로명주소'] || item['지번주소'] || '정보 없음'}</div>
                <div><strong>⏰ 운영시간:</strong> ${item['운영시간'] || '정보 없음'}</div>
                <div><strong>♿ 배리어프리:</strong> 
                    ${item['장애인용 출입문'] === 'Y' ? '출입문 가능' : ''} 
                    ${item['장애인 화장실 유무'] === 'Y' ? '/ 화장실 있음' : ''}
                </div>
            </div>
        `;
        listDiv.appendChild(card);
    });
}
