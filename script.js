// 1. 복사 기능
function copy(text) { 
    navigator.clipboard.writeText(text); 
    alert("복사: " + text); 
}

// 2. 지하철 정보에서 중국어 역명 추출
function getCnSub(text) { 
    const m = text.match(/\((.*?)\)/); 
    return m ? m[1] : text; 
}

// 3. 지하철역 노선 색상 아이콘 처리
function formatSubway(text) {
    const lineMatch = text.match(/(\d+)호선/);
    if (!lineMatch) return text;
    const lineNum = lineMatch[1];
    const stationName = text.split(' ')[0];
    
    return `
        <div style="display: flex; align-items: center; gap: 5px;">
            <span class="subway-tag line-${lineNum}">${lineNum}</span>
            <span>${stationName}</span>
        </div>
    `;
}

// 4. 위치 탭 서브 메뉴 생성
function showSub(type) {
    const sub = document.getElementById('sub-menu');
    const app = document.getElementById('app');
    app.innerHTML = ''; 

    if(type === 'location') {
        sub.innerHTML = `
            <button onclick="render('hotel')">호텔</button>
            <button onclick="render('tour')">관광지</button>
            <button onclick="render('restaurant')">식당</button>
        `;
    }
}

// 5. 2차 탭 렌더링 (window 객체 사용)
function render(cat) {
    // 윈도우 객체에 직접 접근하도록 수정 (이미 위에서 window.으로 선언했으므로 안전)
    const dataMap = { 
        'hotel': window.hotelData, 
        'tour': window.tourData, 
        'restaurant': window.restaurantData 
    };
    
    const list = dataMap[cat];
    
    if (!list) {
        console.error("데이터 로드 안 됨. 현재 window 상태:", window);
        alert("데이터가 로드되지 않았습니다. 잠시 후 다시 시도하세요.");
        return;
    }

    const app = document.getElementById('app');
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
            <div class="data" onclick="copy('${getCnSub(i.sub)}')">${formatSubway(i.sub)}</div>
        </div>
    `).join('');
}
