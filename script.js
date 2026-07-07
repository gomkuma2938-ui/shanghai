// 1. 공통 기능
function copy(text) { 
    navigator.clipboard.writeText(text); 
    alert("복사 완료: " + text); 
}

function getCnSub(text) { 
    const m = text.match(/\((.*?)\)/); 
    return m ? m[1] : text; 
}

function formatSubway(text) {
    const lineMatch = text.match(/(\d+)호선/);
    if (!lineMatch) return text;
    const lineNum = lineMatch[1];
    const stationName = text.split(' ')[0];
    return `<div style="display: flex; align-items: center; gap: 5px;"><span class="subway-tag line-${lineNum}">${lineNum}</span><span>${stationName}</span></div>`;
}

// 2. 1차 탭: 위치 클릭 시 카테고리 선택지 생성
function showSub(type) {
    const sub = document.getElementById('sub-menu');
    document.getElementById('app').innerHTML = ''; // 이전 카드 삭제
    
    if(type === 'location') {
        sub.innerHTML = `
            <button onclick="renderList('hotel')">호텔</button>
            <button onclick="renderList('tour')">관광지</button>
            <button onclick="renderList('restaurant')">식당</button>
        `;
    }
}

// 3. 2차 탭: 카테고리(호텔/관광지 등) 클릭 시 장소 목록 가로 나열
function renderList(cat) {
    const list = window[cat + 'Data'];
    const sub = document.getElementById('sub-menu');
    const app = document.getElementById('app');
    
    app.innerHTML = ''; // 화면 카드 초기화

    sub.innerHTML = list.map((item, index) => `
        <button onclick="renderCard('${cat}', ${index})">${item.kr}</button>
    `).join('');
}

// 4. 카드 출력: 장소 클릭 시 해당 장소 카드만 렌더링
function renderCard(cat, index) {
    const item = window[cat + 'Data'][index];
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div class="card">
            <div class="label">명칭</div>
            <div class="kr-text" onclick="copy('${item.cn}')">${item.kr}</div>
            <div class="cn-text" onclick="copy('${item.cn}')">${item.cn}</div>
            
            <div class="label">주소</div>
            <div class="data" onclick="copy('${item.addr}')">${item.addr}</div>
            
            <div class="label">지하철역</div>
            <div class="data" onclick="copy('${getCnSub(item.sub)}')">${formatSubway(item.sub)}</div>
        </div>
    `;
}
