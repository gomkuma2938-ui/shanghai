// 1. 공통 유틸 함수
function copy(text) { navigator.clipboard.writeText(text); alert("복사 완료: " + text); }
function getCnSub(text) { const m = text.match(/\((.*?)\)/); return m ? m[1] : text; }
function formatSubway(text) {
    const lineMatch = text.match(/(\d+)호선/);
    if (!lineMatch) return text;
    const lineNum = lineMatch[1];
    const stationName = text.split(' ')[0];
    return `<div style="display: flex; align-items: center; gap: 5px;"><span class="subway-tag line-${lineNum}">${lineNum}</span><span>${stationName}</span></div>`;
}

// 2. 1뎁스(하단 메뉴) 선택 시 -> 2뎁스(상단 1차 메뉴) 생성
function showSub(type, btnElement) {
    if (btnElement) {
        document.querySelectorAll('.footer button').forEach(btn => btn.classList.remove('active'));
        btnElement.classList.add('active');
    }

    const depth2 = document.getElementById('menu-depth2');
    
    if(type === 'location') {
        depth2.innerHTML = `
            <button onclick="renderList('hotel', this)">호텔</button>
            <button onclick="renderList('tour', this)">관광지</button>
            <button onclick="renderList('restaurant', this)">식당</button>
        `;
        // 자동으로 호텔 탭 활성화
        renderList('hotel', depth2.querySelector('button'));
    }
}

// 3. 2뎁스(1차 메뉴) 선택 시 -> 3뎁스(2차 메뉴) 장소명 생성
function renderList(cat, btnElement) {
    document.querySelectorAll('#menu-depth2 button').forEach(btn => btn.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');

    const list = window[cat + 'Data'];
    const depth3 = document.getElementById('menu-depth3');
    
    depth3.innerHTML = list.map((item, index) => `
        <button onclick="renderCard('${cat}', ${index}, this)">${item.kr}</button>
    `).join('');

    // 해당 카테고리의 첫 번째 장소 자동 활성화
    renderCard(cat, 0, depth3.querySelector('button'));
}

// 4. 3뎁스(2차 메뉴) 장소명 선택 시 -> 화면 중앙에 카드 렌더링
function renderCard(cat, index, btnElement) {
    document.querySelectorAll('#menu-depth3 button').forEach(btn => btn.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');

    const item = window[cat + 'Data'][index];
    document.getElementById('app').innerHTML = `
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

// 5. 사이트 접속 시 초기화면 (자동으로 '위치' 버튼 클릭)
window.onload = () => {
    const firstTab = document.querySelector('.footer button');
    showSub('location', firstTab);
};
