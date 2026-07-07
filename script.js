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
    const dataMap = { 
        'hotel': window.hotelData, 
        'tour': window.tourData, 
        'restaurant': window.restaurantData 
    };
    
    const list = dataMap[cat];
    
    // 데이터가 없는 경우를 대비한 안전 장치
    if (!list || list.length === 0) {
        console.error(`${cat} 데이터를 찾을 수 없습니다.`);
        document.getElementById('app').innerHTML = '<p>데이터를 불러오는 중이거나 데이터가 없습니다.</p>';
        return;
    }

    const app = document.getElementById('app');
    app.style.display = 'flex';
    app.style.flexDirection = (cat === 'tour') ? 'row' : 'column';
    app.style.overflowX = (cat === 'tour') ? 'auto' : 'visible';

    // 렌더링
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
