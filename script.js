// 1. 복사 기능
function copy(text) { 
    navigator.clipboard.writeText(text); 
    alert("복사: " + text); 
}

// 2. 지하철 정보에서 중국어 역명만 추출 (예: 예원역 (豫园站) -> 豫园站)
function getCnSub(text) { 
    const m = text.match(/\((.*?)\)/); 
    return m ? m[1] : text; 
}

// 3. 지하철역 텍스트를 노선 색상 아이콘으로 변환
function formatSubway(text) {
    // "예원역 (豫园站) - 10호선"에서 숫자 추출
    const lineMatch = text.match(/(\d+)호선/);
    if (!lineMatch) return text;
    
    const lineNum = lineMatch[1];
    const stationName = text.split(' ')[0]; // 역 이름만 가져오기
    
    return `
        <div style="display: flex; align-items: center;">
            <span class="subway-tag line-${lineNum}">${lineNum}</span>
            <span>${stationName}</span>
        </div>
    `;
}

// 4. 위치 탭 클릭 시 서브 메뉴(호텔/관광지/식당) 생성
function showSub(type) {
    const sub = document.getElementById('sub-menu');
    const app = document.getElementById('app');
    app.innerHTML = ''; // 기존 콘텐츠 초기화

    if(type === 'location') {
        sub.innerHTML = `
            <button onclick="render('hotel')">호텔</button>
            <button onclick="render('tour')">관광지</button>
            <button onclick="render('restaurant')">식당</button>
        `;
    }
}

// 5. 2차 탭 클릭 시 데이터 렌더링
function render(cat) {
    // 데이터 매핑 (restaurant.js에서 변수명을 restaurantData로 맞췄다고 가정)
    const dataMap = { 
        'hotel': window.hotelData, 
        'tour': window.tourData, 
        'restaurant': window.restaurantData 
    };
    
    const list = dataMap[cat];
    
    if (!list) {
        console.error(cat + " 데이터를 찾을 수 없습니다.");
        return;
    }

    const app = document.getElementById('app');
    
    // 관광지 전용 슬라이드 스타일 처리
    app.style.display = 'flex';
    app.style.flexDirection = (cat === 'tour') ? 'row' : 'column';
    app.style.overflowX = (cat === 'tour') ? 'auto' : 'visible';

    // 카드 생성
    app.innerHTML = list.map(i => `
        <div class="card ${cat === 'tour' ? 'tour-mode' : ''}">
            <div class="label">명칭</div>
            <div class="kr-text" onclick="copy('${i.cn}')">${i.kr}</div>
            <div class="cn-text" onclick="copy('${i.cn}')">${i.cn}</div>
            
            <div class="label">주소</div>
            <div class="data" onclick="copy('${i.addr}')">${i.addr}</div>
            
            <div class="label">지하철역</div>
            <div class="data" onclick="copy('${getCnSub(i.sub)}')">${formatSubway(i.sub)}</div>
        </div>
    `).join('');
}
