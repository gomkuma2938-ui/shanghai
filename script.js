// 복사 및 지하철 추출 로직
function copy(text) { 
    navigator.clipboard.writeText(text); 
    alert("복사: " + text); 
}

function getCnSub(text) { 
    const m = text.match(/\((.*?)\)/); 
    return m ? m[1] : text; 
}

// 1. 위치 탭 클릭 시 서브 메뉴(호텔/관광지/식당) 생성
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

// 2. 2차 탭 클릭 시 데이터 렌더링
function render(cat) {
    // 각 데이터 변수가 전역에 선언되어 있어야 정상 작동합니다.
    const dataMap = { 'hotel': hotelData, 'tour': tourData, 'restaurant': restaurantData };
    const list = dataMap[cat];
    
    if (!list) return;

    const app = document.getElementById('app');
    // 관광지 전용 슬라이드 스타일 적용
    app.style.display = 'flex';
    app.style.flexDirection = (cat === 'tour') ? 'row' : 'column';
    app.style.overflowX = (cat === 'tour') ? 'auto' : 'visible';

    app.innerHTML = list.map(i => `
        <div class="card ${cat === 'tour' ? 'tour-mode' : ''}">
            <div class="label">명칭</div>
            <div class="kr-text" onclick="copy('${i.cn}')">${i.kr}</div>
            <div class="cn-text" onclick="copy('${i.cn}')">${i.cn}</div>
            <div class="label">주소</div>
            <div class="data" onclick="copy('${i.addr}')">${i.addr}</div>
            <div class="label">지하철역</div>
            <div class="data" onclick="copy('${getCnSub(i.sub)}')">${i.sub}</div>
        </div>
    `).join('');
}
